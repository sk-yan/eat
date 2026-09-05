export type Category =
  "protein" | "vegetable" | "staple" | "other" | "seasoning";
export interface Ingredient {
  id: string;
  name: string;
  searchName?: string;
  aliases: string[];
  category: Category;
  quantity: number;
  unit: string;
}
export interface Recipe {
  id: string;
  title: string;
  ingredientIds: string[];
  origin: "curated" | "online" | "family";
  source: string;
  url: string;
  image?: string | null;
  minutes?: number;
  equipment?: string[];
  prep?: boolean;
  rating?: string | null;
  author?: string;
  sourceTitle?: string;
  note?: string;
  ingredients?: { id: string; amount: number; unit: string }[];
  seasonings?: string[];
  steps?: { id: number; text: string }[];
  ingredientLines?: string[];
  ingredientVerified?: boolean;
  baseServings?: number;
  createdAt?: string;
  updatedAt?: string;
}
export interface SearchResponse {
  recipes: Recipe[];
  provider: string;
  fetchedAt: string;
  cached: boolean;
  searchUrl: string;
  queriedIngredients: string[];
}
