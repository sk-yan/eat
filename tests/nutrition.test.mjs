import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addMacros,
  bmrMifflin,
  energyTargets,
  foodMacros,
  roundMacros,
} from "../shared/nutrition.mjs";

const profile = {
  sex: "female",
  age: 33,
  height: 168,
  weight: 70,
  targetWeight: Number.NaN,
  activity: "mobile",
  sessions: 2,
  strengthMinutes: 45,
  cardioMinutes: 20,
  intensity: "easy",
};

test("Mifflin and separated exercise calculation match a generic profile", () => {
  const result = energyTargets(profile);
  assert.equal(bmrMifflin(profile), 1424);
  assert.equal(result.bmr, 1424);
  assert.equal(Math.round(result.baseDaily), 1922);
  assert.equal(Math.round(result.sessionExercise), 213);
  assert.equal(Math.round(result.averageExercise), 61);
  assert.equal(Math.round(result.tdee), 1983);
  assert.equal(Math.round(result.intake), 1424);
  assert.equal(Math.round(result.macros.protein), 140);
  assert.equal(Math.round(result.macros.fat), 55);
  assert.equal(Math.round(result.macros.carbs), 91);
  assert.equal(result.weeklyLoss.toFixed(2), "0.51");
  assert.equal(result.estimatedWeeks, null);
});

test("optional target weight produces a timeline without changing daily targets", () => {
  const result = energyTargets({ ...profile, targetWeight: 60 });
  assert.ok(result.estimatedWeeks > 19 && result.estimatedWeeks < 21);
  assert.equal(Math.round(result.intake), 1424);
});

test("macro sums preserve the four-nine-four calorie identity", () => {
  const total = addMacros(
    foodMacros("breast", 180),
    foodMacros("rice", 100),
    foodMacros("oil", 8),
  );
  const rounded = roundMacros(total);
  assert.deepEqual(rounded, {
    protein: 43,
    fat: 14,
    carbs: 23,
    calories: 387,
  });
  assert.equal(
    Math.round(total.calories),
    Math.round(total.protein * 4 + total.fat * 9 + total.carbs * 4),
  );
});
