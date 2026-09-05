/** @param {import('../src/types').Recipe} recipe @param {string[]} selected @param {{id: string, category: string}[]} ingredientList */
export function matchRecipe(recipe, selected, ingredientList) {
  const ids = recipe.ingredientIds || [];
  const selectedProteins = selected.filter(
    (id) => ingredientList.find((x) => x.id === id)?.category === "protein",
  );
  const selectedVegetables = selected.filter(
    (id) => ingredientList.find((x) => x.id === id)?.category === "vegetable",
  );
  const matches = ids.filter((id) => selected.includes(id));
  const missing = ids.filter((id) => !selected.includes(id));
  const proteinMatch =
    !selectedProteins.length || selectedProteins.some((id) => ids.includes(id));
  const vegetableMatch =
    !selectedVegetables.length ||
    selectedVegetables.some((id) => ids.includes(id));
  return {
    matches,
    missing,
    eligible:
      selected.length > 0 &&
      matches.length > 0 &&
      proteinMatch &&
      vegetableMatch,
    score:
      matches.length * 12 - missing.length * 3 + (missing.length === 0 ? 8 : 0),
  };
}
/** @param {import('../src/types').Recipe[]} recipes @param {string[]} selected @param {{id: string, category: string}[]} ingredients @param {{strict?: boolean, equipment?: string, maxTime?: number, prep?: boolean}} filters */
export function filterRecipes(recipes, selected, ingredients, filters = {}) {
  return recipes
    .map((recipe) => ({
      recipe,
      ...matchRecipe(recipe, selected, ingredients),
    }))
    .filter(
      (item) =>
        item.eligible &&
        (!filters.strict || item.missing.length === 0) &&
        (!filters.equipment ||
          (item.recipe.equipment || []).includes(filters.equipment)) &&
        (!filters.maxTime ||
          (item.recipe.minutes !== undefined &&
            item.recipe.minutes <= filters.maxTime)) &&
        (!filters.prep || item.recipe.prep),
    )
    .sort((a, b) => b.score - a.score || a.recipe.minutes - b.recipe.minutes);
}
export function validateNames(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 6)
    throw new Error("请选择1至6种食材");
  const names = value.map((x) => {
    if (
      typeof x !== "string" ||
      !/^[\p{L}\p{N}· ()（）-]{1,20}$/u.test(x.trim())
    )
      throw new Error("食材名称格式不正确");
    return x.trim();
  });
  return [...new Set(names)];
}
