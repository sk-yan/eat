import { test } from "node:test";
import assert from "node:assert/strict";
import {
  days,
  week,
  weeklyTotals,
  guides,
  breakfastLines,
  snackLines,
  prepTasks,
  mealTiming,
  dailyCookPlan,
  riceBatches,
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
        assert.ok(ingredients.some((item) => item.id === portion.id));
        assert.ok(portion.grams > 0);
      }
    }
});
test("weekly totals reconcile to the confirmed actual-purchase menu", () => {
  const totals = weeklyTotals();
  assert.equal(totals.rice, 1245);
  assert.equal(totals.vegetables, 4200);
  assert.deepEqual(totals.cooked, { leg: 730, shank: 150 });
  for (const [id, grams] of Object.entries({
    breast: 1190,
    leg: 997,
    shank: 225,
    stirBeef: 250,
    steak: 240,
    shrimp: 540,
    salmon: 220,
    mandarinFish: 650,
    oil: 109,
    sweet: 300,
    potato: 400,
    carrot: 450,
    choy: 500,
    onion: 250,
    baby: 700,
    spinach: 300,
    asparagus: 500,
    mushroom: 650,
    shiitake: 100,
    pepper: 200,
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
    895,
  );
});
test("low-carb weekly plan keeps each day inside its macro guardrails", () => {
  const average = roundMacros(averageMacros(days));
  assert.deepEqual(average, {
    calories: 1760,
    protein: 166,
    fat: 67,
    carbs: 123,
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
  assert.equal(
    totals.foods.stirBeef + totals.foods.steak + totals.foods.shank,
    715,
  );
  assert.equal(totals.foods.rib, undefined);
  assert.equal(totals.foods.shrimp, 540);
  assert.equal(totals.foods.salmon, 220);
  assert.equal(totals.foods.mandarinFish, 650);
  assert.equal(totals.foods.whey, undefined);
  assert.equal(days[2].lunch.extraProtein.id, "leg");
  assert.equal(days[2].lunch.extraProtein.grams, 100);
});
test("main dishes keep the agreed beef, fish, shrimp and poultry mix", () => {
  const mainIds = days.flatMap((day) => [day.lunch.meat.id, day.dinner.meat.id]);
  const count = (ids) => mainIds.filter((id) => ids.includes(id)).length;

  assert.equal(count(["shank", "stirBeef", "steak"]), 3);
  assert.equal(count(["salmon"]), 1);
  assert.equal(count(["mandarinFish"]), 1);
  assert.equal(count(["shrimp"]), 2);
  assert.equal(count(["leg"]), 3);
  assert.equal(count(["breast"]), 4);
});
test("weekend prep only portions raw food and cooks the braised proteins", () => {
  assert.deepEqual(
    prepTasks.map((task) => task.id),
    [
      "labels",
      "marinate-breast",
      "raw-protein",
      "vegetables",
      "braise-shank",
      "braise-legs",
      "store",
    ],
  );
  const weekendText = prepTasks
    .map((task) => `${task.title} ${task.text}`)
    .join(" ");
  assert.match(weekendText, /鸡胸分五袋，提前腌好/);
  assert.match(weekendText, /其余生肉只分装，不提前腌/);
  assert.match(weekendText, /周一袋冷藏，其余压平后立即冷冻/);
  assert.match(weekendText, /约5只中大鸡腿.*220g.*100g.*190g/);
  assert.doesNotMatch(weekendText, /空气炸锅分批做鸡胸|铁锅做虾仁/);
  assert.equal(dailyCookPlan.length, 7);
  assert.equal(new Set(dailyCookPlan.map((item) => item.day)).size, 7);
  assert.equal(
    riceBatches.reduce((sum, batch) => sum + batch.grams, 0),
    1245,
  );
  for (const day of days) {
    assert.ok(mealTiming[day.id].lunch);
    assert.ok(mealTiming[day.id].dinner);
  }
  assert.match(days[0].lunch.meat.countHint, /2只/);
  assert.match(days[2].lunch.extraProtein.countHint, /1只/);
  assert.match(days[5].lunch.meat.countHint, /3只大或4只小/);
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
