import { test } from "node:test";
import assert from "node:assert/strict";
import {
  days,
  week,
  weeklyTotals,
  guides,
  breakfastLines,
  snackLines,
} from "../shared/weekly-plan.mjs";
import { ingredients } from "../shared/ingredients.mjs";
import {
  averageMacros,
  dayMacros,
  mealMacros,
  roundMacros,
} from "../shared/nutrition.mjs";
import sources from "../data/sources.json" with { type: "json" };

test("weekly menu contains seven days, fourteen meals and ten packed meals", () => {
  assert.equal(week.start, "2026-09-07");
  assert.equal(days.length, 7);
  assert.equal(new Set(days.map((day) => day.id)).size, 7);
  assert.equal(days.filter((day) => day.packed).length * 2, 10);
  for (const day of days)
    for (const meal of [day.lunch, day.dinner]) {
      assert.equal(
        meal.vegetables.reduce((sum, item) => sum + item.grams, 0),
        300,
      );
      assert.ok(guides[meal.guide]);
      assert.ok(sources[meal.imageKey]?.url);
      for (const portion of [
        meal.meat,
        ...(meal.extraProtein ? [meal.extraProtein] : []),
        ...meal.vegetables,
        ...(meal.starch ? [meal.starch] : []),
      ]) {
        assert.ok(
          ingredients.some((item) => item.id === portion.id) ||
            portion.id === "salmon",
        );
        assert.ok(portion.grams > 0);
      }
    }
});
test("weekly totals reconcile to the confirmed actual-purchase menu", () => {
  const totals = weeklyTotals();
  assert.equal(totals.rice, 1205);
  assert.equal(totals.vegetables, 4200);
  assert.deepEqual(totals.cooked, { leg: 730, shank: 150 });
  for (const [id, grams] of Object.entries({
    breast: 1280,
    leg: 997,
    shank: 225,
    rib: 230,
    steak: 240,
    shrimp: 540,
    salmon: 420,
    oil: 94,
    sweet: 300,
    potato: 400,
    carrot: 600,
    choy: 500,
    onion: 350,
    baby: 750,
    spinach: 300,
    asparagus: 500,
    mushroom: 650,
    broccoli: 550,
    egg: 14,
    milk: 1750,
    yogurt: 1350,
    blueberry: 1050,
  }))
    assert.equal(totals.foods[id], grams, id);
  assert.equal(
    days
      .filter((day) => day.packed)
      .reduce((sum, day) => sum + day.lunch.rice + day.dinner.rice, 0),
    875,
  );
});
test("low-carb weekly plan keeps each day inside its macro guardrails", () => {
  const average = roundMacros(averageMacros(days));
  assert.deepEqual(average, {
    calories: 1762,
    protein: 164,
    fat: 68,
    carbs: 122,
  });
  for (const day of days) {
    const macros = roundMacros(dayMacros(day));
    assert.ok(macros.calories >= 1700 && macros.calories <= 1850, day.label);
    assert.ok(macros.protein >= 155 && macros.protein <= 180, day.label);
    assert.ok(macros.carbs >= 105 && macros.carbs <= 140, day.label);
    assert.ok(mealMacros(day.lunch).protein >= 50, `${day.label}午餐`);
    assert.ok(mealMacros(day.dinner).protein >= 50, `${day.label}晚餐`);
  }
  const totals = weeklyTotals();
  assert.equal(totals.foods.rib + totals.foods.steak + totals.foods.shank, 695);
  assert.equal(totals.foods.shrimp, 540);
  assert.equal(totals.foods.salmon, 420);
  assert.equal(totals.foods.whey, undefined);
  assert.equal(days[2].lunch.extraProtein.id, "leg");
  assert.equal(days[2].lunch.extraProtein.grams, 100);
});
test("main dishes keep the agreed beef, fish, shrimp and poultry mix", () => {
  const mainIds = days.flatMap((day) => [day.lunch.meat.id, day.dinner.meat.id]);
  const count = (ids) => mainIds.filter((id) => ids.includes(id)).length;

  assert.equal(count(["shank", "rib", "steak"]), 3);
  assert.equal(count(["salmon"]), 2);
  assert.equal(count(["shrimp"]), 2);
  assert.equal(count(["leg"]), 3);
  assert.equal(count(["breast"]), 4);
});
test("milk and yogurt breakfasts alternate without duplicating daily food", () => {
  assert.equal(days.filter((day) => day.breakfast === "yogurt").length, 3);
  assert.equal(days.filter((day) => day.extraYogurt).length, 3);
  for (const day of days) {
    const all = [...breakfastLines(day), ...snackLines(day)];
    assert.equal(all.filter((line) => line.includes("鸡蛋")).length, 1);
    assert.equal(all.filter((line) => line.includes("牛奶")).length, 1);
    assert.equal(all.filter((line) => line.includes("蓝莓")).length, 1);
    assert.equal(
      all.filter((line) => line.includes("酸奶")).length,
      day.extraYogurt ? 2 : 1,
    );
  }
});
