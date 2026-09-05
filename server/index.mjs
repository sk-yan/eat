import express from "express";
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog } from "./catalog.mjs";
import { ingredients, identifyIngredients } from "../shared/ingredients.mjs";
import { validateNames, matchRecipe } from "../shared/matching.mjs";
import { searchSource, fetchDetail } from "./source.mjs";
import { createFamilyStore, attachFamilyRoutes } from "./family.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const app = express();
const cache = new Map();
const host = process.env.HOST || "127.0.0.1";
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Frame-Options", "DENY");
  if (request.method !== "GET" && request.headers.origin) {
    try {
      const origin = new URL(request.headers.origin);
      if (
        !["http:", "https:"].includes(origin.protocol) ||
        origin.host !== request.headers.host
      ) {
        return response.status(403).json({ error: "请求来源与网站不一致" });
      }
    } catch {
      return response.status(403).json({ error: "请求来源不正确" });
    }
  }
  next();
});
const familyStore = await createFamilyStore(
  path.resolve(process.env.FAMILY_DATA_DIR || path.join(root, ".family-data")),
);
attachFamilyRoutes(app, familyStore, {
  code: process.env.FAMILY_CODE || "",
  localOnly: host === "127.0.0.1" && process.env.NODE_ENV !== "production",
});
app.use(express.json({ limit: "8kb" }));
app.get("/api/health", (_, response) =>
  response.json({ ok: true, recipes: catalog.length }),
);
app.get("/api/catalog", (_, response) => response.json({ recipes: catalog }));

app.post("/api/search", async (request, response) => {
  let names;
  try {
    names = validateNames(request.body?.ingredients);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
  const key = names.slice().sort().join("|");
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 600_000)
    return response.json({ ...cached.result, cached: true });
  try {
    const result = await searchSource(names);
    const selectedIds = ingredients
      .filter((item) =>
        names.some((name) =>
          [item.name, item.searchName, ...item.aliases].includes(name),
        ),
      )
      .map((item) => item.id);
    result.recipes = result.recipes
      .filter((recipe) => !/豆腐|燕麦|猪肝|鸡胗|内脏/.test(recipe.title))
      .map((recipe) => ({
        ...recipe,
        ingredientIds: identifyIngredients(recipe.title),
      }))
      .filter((recipe) =>
        selectedIds.length
          ? matchRecipe(recipe, selectedIds, ingredients).eligible
          : names.some((name) => recipe.title.includes(name)),
      );
    const payload = {
      ...result,
      queriedIngredients: names,
      fetchedAt: new Date().toISOString(),
      provider: "下厨房",
      cached: false,
    };
    if (cache.size >= 60) cache.delete(cache.keys().next().value);
    cache.set(key, { timestamp: Date.now(), result: payload });
    response.json(payload);
  } catch (error) {
    response.status(error.status || 502).json({
      error: error.message?.includes("timeout")
        ? "原站响应超时，请稍后重试"
        : error.message || "暂时无法连接菜谱来源",
    });
  }
});
app.post("/api/recipe", async (request, response) => {
  if (typeof request.body?.url !== "string" || request.body.url.length > 250)
    return response.status(400).json({ error: "菜谱链接不正确" });
  try {
    const recipe = await fetchDetail(request.body.url);
    response.json({
      ...recipe,
      ingredientIds: identifyIngredients(recipe.ingredientLines.join(" ")),
    });
  } catch (error) {
    response
      .status(error.status || 502)
      .json({ error: error.message || "原站食材暂不可读取" });
  }
});
app.use("/api", (_, response) =>
  response.status(404).json({ error: "接口不存在" }),
);
if (process.argv.includes("--dev")) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    root,
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(root, "dist")));
  app.use((request, response) => {
    if (request.method === "GET" && request.accepts("html"))
      response.sendFile(path.join(root, "dist/index.html"));
    else response.sendStatus(404);
  });
}
const firstPort = Number(process.env.PORT || 5173);
if (!Number.isInteger(firstPort) || firstPort < 1 || firstPort > 65535)
  throw new Error("PORT must be an integer from 1 to 65535");
const lastPort = process.env.PORT ? firstPort : Math.min(firstPort + 19, 65535);
app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  response
    .status(status)
    .json({
      error:
        status === 413
          ? "内容太大，请缩小照片后重试"
          : status === 400
            ? "请求内容格式不正确"
            : status === 404
              ? "内容不存在"
              : "请求失败，请稍后重试",
    });
});
for (let port = firstPort; port <= lastPort; port++) {
  try {
    const server = createServer(app);
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, host, resolve);
    });
    await mkdir(path.join(root, ".runtime"), { recursive: true });
    await writeFile(
      path.join(root, ".runtime/server.json"),
      JSON.stringify({
        pid: process.pid,
        port,
        url: `http://127.0.0.1:${port}`,
        startedAt: new Date().toISOString(),
      }),
    );
    console.log(`Afterwork Kitchen: http://${host}:${port}`);
    break;
  } catch (error) {
    if (error.code !== "EADDRINUSE" || port === lastPort) throw error;
  }
}
