import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import express from "express";
import {
  createFamilyStore,
  validateRecipe,
  decodePhoto,
  attachFamilyRoutes,
} from "../server/family.mjs";
const body = {
  title: "测试家常菜",
  author: "测试作者",
  ingredientLines: ["鸡胸肉150g", "西兰花250g"],
  steps: ["洗净并切好。", "炒至鸡肉中心74℃。"],
  minutes: 20,
  baseServings: 2,
  equipment: ["wok"],
  prep: true,
  note: "测试备注",
};
const tinyPng =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jGqkAAAAASUVORK5CYII=";
test("validates family recipe fields and rejects malformed photo data", () => {
  assert.equal(validateRecipe(body).origin, "family");
  assert.throws(() => validateRecipe({ ...body, title: "" }));
  assert.throws(() => validateRecipe({ ...body, steps: [] }));
  assert.throws(() => validateRecipe({ ...body, minutes: -1 }));
  assert.throws(() => decodePhoto("data:image/svg+xml;base64,PHN2Zy8+"));
  assert.throws(() => decodePhoto("data:image/png;base64,aGVsbG93b3JsZA=="));
  assert.equal(decodePhoto(tinyPng).extension, "png");
});
test("family recipes and photos survive reopening; stale edits fail; archive is reversible", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "family-store-test-"));
  try {
    let store = await createFamilyStore(dir);
    const added = await store.save({ ...body, photoData: tinyPng });
    assert.match(added.image, /^\/family-images\/[a-f0-9-]+\.png$/);
    store = await createFamilyStore(dir);
    assert.equal(store.list()[0].title, body.title);
    assert.equal((await readdir(store.images)).length, 1);
    const edited = await store.save(
      { ...body, title: "更新菜名", updatedAt: added.updatedAt },
      added.id,
    );
    assert.equal(edited.image, added.image);
    await assert.rejects(
      () => store.save({ ...body, updatedAt: added.updatedAt }, added.id),
      (e) => e.status === 409,
    );
    await store.archive(added.id);
    assert.equal(store.list().length, 0);
    await store.archive(added.id, true);
    assert.equal(store.list().length, 1);
    const reopened = await createFamilyStore(dir);
    assert.equal(reopened.list()[0].title, "更新菜名");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test("serial writes preserve simultaneous additions", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "family-concurrent-test-"));
  try {
    const store = await createFamilyStore(dir);
    await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        store.save({ ...body, title: `菜谱${i}` }),
      ),
    );
    assert.equal(store.list().length, 12);
    assert.equal((await createFamilyStore(dir)).list().length, 12);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test("public write requires family code; two clients see the same server recipe", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "family-http-test-"));
  const app = express();
  const store = await createFamilyStore(dir);
  attachFamilyRoutes(app, store, {
    localOnly: false,
    code: "test-family-code-only",
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const request = (url, data, cookie) =>
      fetch(base + url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { cookie } : {}),
        },
        body: JSON.stringify(data),
      });
    assert.equal((await request("/api/family/recipes", body)).status, 401);
    assert.equal(
      (await request("/api/family/session", { code: "incorrect" })).status,
      401,
    );
    const session = await request("/api/family/session", {
      code: "test-family-code-only",
    });
    assert.equal(session.status, 200);
    const cookie = session.headers.get("set-cookie").split(";")[0];
    assert.equal(
      (await request("/api/family/recipes", body, cookie)).status,
      200,
    );
    const independentClient = await (await fetch(base + "/api/family")).json();
    assert.equal(independentClient.recipes.length, 1);
    assert.equal(independentClient.canEdit, false);
    const authenticatedClient = await (
      await fetch(base + "/api/family", { headers: { cookie } })
    ).json();
    assert.equal(authenticatedClient.canEdit, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(dir, { recursive: true, force: true });
  }
});
test("public deployments without configured code cannot create recipes", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "family-closed-test-"));
  const app = express();
  attachFamilyRoutes(app, await createFamilyStore(dir), {
    localOnly: false,
    code: "",
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const r = await fetch(
      `http://127.0.0.1:${server.address().port}/api/family/recipes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    assert.equal(r.status, 503);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(dir, { recursive: true, force: true });
  }
});
