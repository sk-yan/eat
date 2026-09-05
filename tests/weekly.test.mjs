import { test } from "node:test";
import assert from "node:assert/strict";
import {
  days,
  week,
  weeklyTotals,
  guides,
  breakfastLines,
  snackLines,
  proteinTarget,
  dailyProtein,
  mealProtein,
} from "../shared/weekly-plan.mjs";
import { ingredients } from "../shared/ingredients.mjs";
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
  assert.equal(totals.rice, 2800);
  assert.equal(totals.vegetables, 4200);
  assert.deepEqual(totals.cooked, { leg: 350, shank: 120 });
  for (const [id, grams] of Object.entries({
    breast: 1085,
    leg: 475,
    shank: 180,
    rib: 150,
    steak: 150,
    shrimp: 250,
    sweet: 450,
    potato: 800,
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
    2000,
  );
});
test("each day reaches the protein target while beef and shrimp stay bounded", () => {
  assert.deepEqual(proteinTarget, { min: 120, max: 130 });
  for (const day of days) {
    const protein = dailyProtein(day);
    assert.ok(protein >= proteinTarget.min, `${day.label}: ${protein}`);
    assert.ok(protein <= proteinTarget.max, `${day.label}: ${protein}`);
    assert.ok(mealProtein(day.lunch) >= 30, `${day.label}午餐`);
    assert.ok(mealProtein(day.dinner) >= 30, `${day.label}晚餐`);
  }
  const totals = weeklyTotals();
  assert.equal(totals.foods.rib + totals.foods.steak + totals.foods.shank, 480);
  assert.equal(totals.foods.shrimp, 250);
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
