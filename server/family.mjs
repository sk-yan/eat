import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { mkdir, readFile, rename, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import express from "express";
import { identifyIngredients } from "../shared/ingredients.mjs";

export class FamilyError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
function text(value, min, max, label) {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    throw new FamilyError(`${label}需要${min}至${max}个字`);
  return value.trim();
}
export function validateRecipe(body) {
  if (!body || typeof body !== "object")
    throw new FamilyError("菜谱内容不完整");
  const title = text(body.title, 1, 70, "菜名");
  const author = text(body.author || "家人", 1, 30, "称呼");
  if (
    !Array.isArray(body.ingredientLines) ||
    body.ingredientLines.length < 1 ||
    body.ingredientLines.length > 30
  )
    throw new FamilyError("请填写1至30行食材");
  if (
    !Array.isArray(body.steps) ||
    body.steps.length < 1 ||
    body.steps.length > 25
  )
    throw new FamilyError("请填写1至25个做法步骤");
  const ingredientLines = body.ingredientLines.map((line) =>
    text(line, 1, 120, "食材行"),
  );
  const steps = body.steps.map((line, i) => ({
    id: i + 1,
    text: text(line, 1, 600, "步骤"),
  }));
  const minutes = Number(body.minutes),
    baseServings = Number(body.baseServings);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440)
    throw new FamilyError("用时需为1至1440分钟");
  if (!Number.isInteger(baseServings) || baseServings < 1 || baseServings > 20)
    throw new FamilyError("份量需为1至20人份");
  if (
    !Array.isArray(body.equipment) ||
    body.equipment.some(
      (id) => !["wok", "air-fryer", "pressure", "casserole"].includes(id),
    )
  )
    throw new FamilyError("请选择支持的厨具");
  return {
    title,
    author,
    ingredientLines,
    steps,
    minutes,
    baseServings,
    equipment: [...new Set(body.equipment)],
    prep: Boolean(body.prep),
    note: typeof body.note === "string" ? body.note.trim().slice(0, 600) : "",
    ingredientIds: identifyIngredients(ingredientLines.join(" ")),
    origin: "family",
    source: "全家菜谱",
    url: "",
  };
}
export function decodePhoto(value) {
  if (!value) return null;
  if (typeof value !== "string") throw new FamilyError("图片格式不正确");
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(
    value,
  );
  if (!match || match[2].length > 2_800_000)
    throw new FamilyError("照片须为JPG、PNG或WebP，压缩后不超过2MB");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 2_000_000 || buffer.length < 12)
    throw new FamilyError("图片大小不正确");
  const valid =
    match[1] === "jpeg"
      ? buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
      : match[1] === "png"
        ? buffer
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : buffer.toString("ascii", 0, 4) === "RIFF" &&
          buffer.toString("ascii", 8, 12) === "WEBP";
  if (!valid) throw new FamilyError("图片内容与格式不符");
  return { buffer, extension: match[1] === "jpeg" ? "jpg" : match[1] };
}
export async function createFamilyStore(directory) {
  const file = path.join(directory, "recipes.json");
  const images = path.join(directory, "images");
  await mkdir(images, { recursive: true });
  let recipes;
  try {
    recipes = JSON.parse(await readFile(file, "utf8"));
    if (!Array.isArray(recipes)) throw new Error("Recipe data is not an array");
  } catch (error) {
    if (error.code === "ENOENT") recipes = [];
    else throw error;
  }
  let queue = Promise.resolve();
  async function change(operation) {
    const job = queue.then(async () => {
      const next = structuredClone(recipes);
      const result = await operation(next);
      const temporary = `${file}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, JSON.stringify(next, null, 2), {
          mode: 0o600,
        });
        await rename(temporary, file);
      } catch (error) {
        await unlink(temporary).catch(() => {});
        throw error;
      }
      recipes = next;
      return result;
    });
    queue = job.catch(() => {});
    return job;
  }
  return {
    images,
    list: () =>
      recipes
        .filter((recipe) => !recipe.deletedAt)
        .slice()
        .reverse(),
    async save(body, id) {
      const content = validateRecipe(body);
      const photo = decodePhoto(body.photoData);
      return change(async (next) => {
        if (!id && next.length >= 1000)
          throw new FamilyError("菜谱数量已达上限，请先备份整理", 409);
        const index = id
          ? next.findIndex((recipe) => recipe.id === id && !recipe.deletedAt)
          : -1;
        if (id && index < 0) throw new FamilyError("菜谱不存在", 404);
        const old = index >= 0 ? next[index] : null;
        if (old && body.updatedAt !== old.updatedAt)
          throw new FamilyError("这道菜刚被家人更新，请刷新后再编辑", 409);
        let image = body.removePhoto ? null : old?.image || null;
        if (photo) {
          const filename = `${randomUUID()}.${photo.extension}`;
          await writeFile(path.join(images, filename), photo.buffer, {
            flag: "wx",
            mode: 0o600,
          });
          image = `/family-images/${filename}`;
        }
        const now = new Date(
          Math.max(Date.now(), old ? Date.parse(old.updatedAt) + 1 : 0),
        ).toISOString();
        const recipe = {
          ...content,
          image,
          id: old?.id || `family-${randomUUID()}`,
          createdAt: old?.createdAt || now,
          updatedAt: now,
        };
        if (index >= 0) next[index] = recipe;
        else next.push(recipe);
        return recipe;
      });
    },
    async archive(id, restore = false) {
      return change((next) => {
        const recipe = next.find((recipe) => recipe.id === id);
        if (!recipe) throw new FamilyError("菜谱不存在", 404);
        recipe.deletedAt = restore ? null : new Date().toISOString();
        recipe.updatedAt = new Date(
          Math.max(Date.now(), Date.parse(recipe.updatedAt) + 1),
        ).toISOString();
        return recipe;
      });
    },
  };
}
export function attachFamilyRoutes(
  app,
  store,
  { code = "", localOnly = true } = {},
) {
  const sessions = new Map(),
    attempts = new Map();
  const configured = localOnly || code.length >= 8;
  const authorized = (request) => {
    if (!code && localOnly) return true;
    const token = /(?:^|;\s*)kitchen_session=([a-f0-9]{64})(?:;|$)/.exec(
      request.headers.cookie || "",
    )?.[1];
    return token && (sessions.get(token) || 0) > Date.now();
  };
  const requireEdit = (request, response, next) => {
    if (!configured)
      return response
        .status(503)
        .json({ error: "网站尚未配置家庭口令，请联系管理员" });
    if (!authorized(request))
      return response.status(401).json({ error: "请输入家庭口令后保存" });
    next();
  };
  app.get("/api/family", (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.json({
      recipes: store.list(),
      canEdit: Boolean(authorized(request)),
      requiresCode: Boolean(code),
      configured,
    });
  });
  app.post(
    "/api/family/session",
    express.json({ limit: "2kb" }),
    (request, response) => {
      if (!configured)
        return response.status(503).json({ error: "网站尚未配置家庭口令" });
      const key = request.ip || "unknown";
      const attempt = attempts.get(key);
      if (attempt && attempt.until > Date.now() && attempt.count >= 8)
        return response.status(429).json({ error: "尝试较多，请15分钟后再试" });
      if (!code && localOnly) return response.json({ ok: true });
      const input =
        typeof request.body?.code === "string" ? request.body.code : "";
      const same = timingSafeEqual(
        createHash("sha256").update(input).digest(),
        createHash("sha256").update(code).digest(),
      );
      if (!same) {
        if (attempts.size > 200) attempts.delete(attempts.keys().next().value);
        attempts.set(key, {
          count: attempt && attempt.until > Date.now() ? attempt.count + 1 : 1,
          until: Date.now() + 900000,
        });
        return response.status(401).json({ error: "口令不正确" });
      }
      attempts.delete(key);
      for (const [token, expires] of sessions)
        if (expires < Date.now()) sessions.delete(token);
      if (sessions.size > 100) sessions.delete(sessions.keys().next().value);
      const token = randomBytes(32).toString("hex");
      sessions.set(token, Date.now() + 30 * 86400000);
      response.cookie("kitchen_session", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: Boolean(request.secure),
        maxAge: 30 * 86400000,
        path: "/",
      });
      response.json({ ok: true });
    },
  );
  const handleSave = async (request, response) => {
    try {
      response.json({
        recipe: await store.save(request.body, request.params.id),
      });
    } catch (error) {
      response
        .status(error.status || 500)
        .json({ error: error.status ? error.message : "保存失败，请稍后重试" });
    }
  };
  app.post(
    "/api/family/recipes",
    requireEdit,
    express.json({ limit: "3mb" }),
    handleSave,
  );
  app.put(
    "/api/family/recipes/:id",
    requireEdit,
    express.json({ limit: "3mb" }),
    handleSave,
  );
  app.delete(
    "/api/family/recipes/:id",
    requireEdit,
    async (request, response) => {
      try {
        await store.archive(request.params.id);
        response.json({ ok: true });
      } catch (error) {
        response
          .status(error.status || 500)
          .json({ error: error.status ? error.message : "操作失败" });
      }
    },
  );
  app.post(
    "/api/family/recipes/:id/restore",
    requireEdit,
    async (request, response) => {
      try {
        response.json({ recipe: await store.archive(request.params.id, true) });
      } catch (error) {
        response
          .status(error.status || 500)
          .json({ error: error.status ? error.message : "恢复失败" });
      }
    },
  );
  app.use(
    "/family-images",
    express.static(store.images, {
      dotfiles: "deny",
      fallthrough: false,
      index: false,
      maxAge: "1d",
    }),
  );
}
