import { load } from "cheerio";

const ORIGIN = "https://m.xiachufang.com";
export class SourceError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}
export function recipeUrl(value) {
  const url = new URL(value, ORIGIN);
  if (
    url.protocol !== "https:" ||
    !["m.xiachufang.com", "www.xiachufang.com"].includes(url.hostname) ||
    !/^\/recipe\/\d+\/?$/.test(url.pathname) ||
    url.username ||
    url.password ||
    url.port
  ) {
    throw new SourceError("菜谱链接不受支持", 400);
  }
  return `${ORIGIN}${url.pathname.replace(/\/?$/, "/")}`;
}
export function safeImage(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /^i\d\.chuimg\.com$/.test(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
async function getPage(url) {
  let current = url;
  for (let count = 0; count < 3; count++) {
    const response = await fetch(current, {
      headers: {
        "User-Agent": "AfterworkKitchen/1.0 (personal recipe finder)",
        Accept: "text/html",
        "Accept-Language": "zh-CN",
      },
      signal: AbortSignal.timeout(12000),
      redirect: "manual",
    });
    if (response.status >= 300 && response.status < 400) {
      const next = new URL(response.headers.get("location") || "/", current);
      if (next.origin !== ORIGIN || next.pathname.includes("auth"))
        throw new SourceError("原站要求验证，请在原站继续查看");
      current = next.href;
      continue;
    }
    if (!response.ok)
      throw new SourceError(`菜谱来源暂时不可用（${response.status}）`);
    const text = await response.text();
    if (text.length > 3_000_000) throw new SourceError("原站响应过大");
    if (/humancheck_captcha|滑动验证|请完成验证/.test(text))
      throw new SourceError("原站要求验证，请在原站继续查看");
    return text;
  }
  throw new SourceError("原站重定向次数过多");
}
export function parseSearch(html) {
  const $ = load(html);
  const found = new Map();
  $("a.recipe-96-horizon[href]").each((_, element) => {
    const el = $(element);
    try {
      const url = recipeUrl(el.attr("href"));
      const title = el
        .find(".name")
        .text()
        .replace(/\p{Extended_Pictographic}|\uFE0F/gu, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!title || /抗癌|治愈|[瘦减]\s*\d+\s*[斤公斤]/.test(title)) return;
      const id = `web-${new URL(url).pathname.split("/")[2]}`;
      const stat = el.find(".stat");
      const rating = stat.text().trim().startsWith("评分")
        ? stat.find("span").first().text().trim()
        : null;
      found.set(id, {
        id,
        title,
        url,
        image: safeImage(
          el.find("img").attr("data-src") || el.find("img").attr("src"),
        ),
        source: "下厨房",
        origin: "online",
        rating: rating && /^\d+(\.\d+)?$/.test(rating) && Number(rating) <= 10 ? rating : null,
        ingredientIds: [],
        ingredientLines: [],
        ingredientVerified: false,
      });
    } catch {
      /* Ignore unrelated or malformed links in source HTML. */
    }
  });
  return [...found.values()].slice(0, 15);
}
function findRecipe(value) {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) return value.map(findRecipe).find(Boolean) || null;
  if (value["@type"] === "Recipe" || value["@type"]?.includes?.("Recipe"))
    return value;
  return findRecipe(value["@graph"]);
}
export function parseDetail(html, url) {
  const $ = load(html);
  let recipe = null;
  $('script[type="application/ld+json"]').each((_, node) => {
    try {
      recipe ||= findRecipe(JSON.parse($(node).text()));
    } catch {
      /* Some pages include non-JSON tracking scripts. */
    }
  });
  if (!recipe)
    throw new SourceError("原站暂未提供可解析的食材清单，请打开原菜谱");
  const image =
    typeof recipe.image === "string"
      ? recipe.image
      : Array.isArray(recipe.image)
        ? recipe.image[0]
        : recipe.image?.url;
  const author =
    typeof recipe.author === "string"
      ? recipe.author
      : Array.isArray(recipe.author)
        ? recipe.author[0]?.name
        : recipe.author?.name;
  return {
    url: recipeUrl(url),
    title: String(recipe.name || "").slice(0, 180),
    author: String(author || "").slice(0, 100),
    image: safeImage(image),
    ingredientLines: Array.isArray(recipe.recipeIngredient)
      ? recipe.recipeIngredient
          .filter((x) => typeof x === "string")
          .slice(0, 35)
          .map((x) => x.slice(0, 120))
      : [],
    source: "下厨房",
    ingredientVerified: true,
  };
}
export async function searchSource(names) {
  const url = new URL("/search/", ORIGIN);
  url.searchParams.set("keyword", names.join(" "));
  const html = await getPage(url.href);
  return { recipes: parseSearch(html), searchUrl: url.href };
}
export async function fetchDetail(url) {
  const normalized = recipeUrl(url);
  return parseDetail(await getPage(normalized), normalized);
}
