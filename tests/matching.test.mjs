import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filterRecipes,
  matchRecipe,
  validateNames,
} from "../shared/matching.mjs";
import { ingredients } from "../shared/ingredients.mjs";
import {
  parseSearch,
  parseDetail,
  recipeUrl,
  safeImage,
} from "../server/source.mjs";
const r = (
  id,
  ingredientIds,
  minutes = 20,
  equipment = ["wok"],
  prep = true,
) => ({ id, ingredientIds, minutes, equipment, prep });
const data = [
  r("complete", ["breast", "broccoli"]),
  r("extra", ["breast", "broccoli", "potato"], 30, ["air-fryer"]),
  r("wrongMeat", ["rib", "broccoli"]),
  r("wrongVeg", ["breast", "asparagus"]),
  r("quick", ["breast", "broccoli"], 15, ["wok"], false),
];
test("matches selected protein and vegetable, not just one of them", () => {
  assert.deepEqual(
    new Set(
      filterRecipes(data, ["breast", "broccoli"], ingredients).map(
        (x) => x.recipe.id,
      ),
    ),
    new Set(["complete", "extra", "quick"]),
  );
});
test("strict selection excludes additional primary ingredients", () => {
  assert.equal(
    filterRecipes(data, ["breast", "broccoli"], ingredients, {
      strict: true,
    }).some((x) => x.recipe.id === "extra"),
    false,
  );
  assert.deepEqual(
    matchRecipe(data[1], ["breast", "broccoli"], ingredients).missing,
    ["potato"],
  );
});
test("equipment, time and meal-prep filters combine correctly", () => {
  assert.equal(
    filterRecipes(data, ["breast", "broccoli"], ingredients, {
      equipment: "air-fryer",
    })[0].recipe.id,
    "extra",
  );
  assert.equal(
    filterRecipes(data, ["breast", "broccoli"], ingredients, {
      maxTime: 15,
      prep: true,
    }).length,
    0,
  );
  assert.equal(
    filterRecipes(data, ["breast", "broccoli"], ingredients, { maxTime: 15 })[0]
      .recipe.id,
    "quick",
  );
});
test("empty selection does not claim matches", () =>
  assert.equal(filterRecipes(data, [], ingredients).length, 0));
test("input constraints reject URLs, too many ingredients and malformed data", () => {
  assert.throws(() => validateNames(["https://evil.test"]));
  assert.throws(() => validateNames("chicken"));
  assert.throws(() => validateNames(Array(7).fill("虾仁")));
  assert.deepEqual(validateNames([" 芦笋 ", "虾仁", "芦笋"]), ["芦笋", "虾仁"]);
});
test("remote URLs are restricted to recipe paths and image CDN", () => {
  for (const url of [
    "http://127.0.0.1/recipe/123/",
    "https://m.xiachufang.com.evil.test/recipe/123/",
    "https://m.xiachufang.com/auth/",
    "https://user@m.xiachufang.com/recipe/123/",
  ])
    assert.throws(() => recipeUrl(url));
  assert.equal(
    recipeUrl("/recipe/123/"),
    "https://m.xiachufang.com/recipe/123/",
  );
  assert.equal(safeImage("https://example.com/image.jpg"), null);
});
test("search parser only accepts observed recipe cards and deduplicates", () => {
  const card =
    '<a class="recipe-96-horizon" href="/recipe/123/"><header class="name">芦笋虾仁</header><img data-src="https://i2.chuimg.com/sample.jpg"><div class="stat">评分 <span>8.1</span><span>20</span>人做过</div></a>';
  const results = parseSearch(
    card + card + '<a href="https://example.com">advertisement</a>',
  );
  assert.equal(results.length, 1);
  assert.equal(results[0].rating, "8.1");
  assert.equal(results[0].ingredientVerified, false);
});
test("recipe completion counts are not mistaken for ratings", () => {
  const results = parseSearch('<a class="recipe-96-horizon" href="/recipe/321/"><header class="name">芦笋虾仁</header><div class="stat"><span>2</span> 人做过</div></a>');
  assert.equal(results[0].rating, null);
});
test("detail parser extracts factual ingredients, never republishes full instructions", () => {
  const html =
    '<script type="application/ld+json">' +
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: "芦笋虾仁",
      recipeIngredient: ["虾仁150g", "芦笋250g"],
      recipeInstructions: "A full copyrighted instruction",
      author: { name: "作者" },
    }) +
    "</script>";
  const result = parseDetail(html, "https://m.xiachufang.com/recipe/123/");
  assert.deepEqual(result.ingredientLines, ["虾仁150g", "芦笋250g"]);
  assert.equal(result.author, "作者");
  assert.equal("recipeInstructions" in result, false);
});
