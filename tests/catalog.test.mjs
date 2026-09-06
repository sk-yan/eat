import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog } from "../server/catalog.mjs";
import { equipment, ingredients } from "../shared/ingredients.mjs";

test("new home-style dishes are source-backed and selectable", () => {
  const expected = [
    ["stir-beef", ["stirBeef", "pepper"], ["wok"]],
    ["shiitake-chicken", ["leg", "shiitake"], ["steamer"]],
    ["steamed-mandarin-fish", ["mandarinFish"], ["steamer"]],
  ];

  for (const [id, ingredientIds, equipmentIds] of expected) {
    const recipe = catalog.find((item) => item.id === id);
    assert.ok(recipe, id);
    assert.match(recipe.url, /^https:\/\/(m|www)\.xiachufang\.com\/recipe\/\d+\/$/);
    assert.ok(recipe.image, id);
    for (const ingredientId of ingredientIds)
      assert.ok(recipe.ingredientIds.includes(ingredientId), ingredientId);
    for (const equipmentId of equipmentIds)
      assert.ok(recipe.equipment.includes(equipmentId), equipmentId);
  }

  for (const id of ["stirBeef", "mandarinFish", "shiitake", "pepper"])
    assert.ok(ingredients.some((item) => item.id === id), id);
  assert.ok(equipment.some((item) => item.id === "steamer"));
});
