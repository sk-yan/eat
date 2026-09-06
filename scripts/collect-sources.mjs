import { mkdir, writeFile, readFile } from "node:fs/promises";
import { searchSource, fetchDetail } from "../server/source.mjs";

const queries = {
  chickenBroccoli: ["鸡胸肉", "西兰花"],
  chickenThree: ["鸡胸肉", "西兰花", "口蘑"],
  chickenMushroom: ["鸡胸肉", "口蘑"],
  chickenPotato: ["鸡胸肉", "土豆", "空气炸锅"],
  chickenAsparagus: ["鸡胸肉", "芦笋"],
  shrimpAsparagus: ["虾仁", "芦笋"],
  shrimpMushroom: ["虾仁", "口蘑"],
  shrimpBroccoli: ["虾仁", "西兰花"],
  steakMushroom: ["牛排", "口蘑"],
  beefRib: ["牛肋条", "洋葱", "土豆"],
  beefShank: ["卤牛腱"],
  braisedLeg: ["卤鸡腿"],
  chickenChoy: ["鸡胸肉", "菜心"],
  spinachEgg: ["菠菜", "鸡蛋"],
  babyShrimp: ["娃娃菜", "虾仁"],
  yogurt: ["蓝莓酸奶碗"],
  legMushroom: ["鸡腿", "口蘑"],
  salmonAsparagus: ["三文鱼", "芦笋", "口蘑"],
  salmonBroccoli: ["三文鱼", "西兰花"],
  stirBeef: ["小炒黄牛肉"],
  shiitakeChicken: ["香菇滑鸡"],
  mandarinFish: ["清蒸鳜鱼"],
};
const directUrls = {
  salmonBroccoli: "https://m.xiachufang.com/recipe/102847085/",
  stirBeef: "https://m.xiachufang.com/recipe/102879997/",
  shiitakeChicken: "https://m.xiachufang.com/recipe/106835791/",
  mandarinFish: "https://m.xiachufang.com/recipe/104192246/",
};
await mkdir("data", { recursive: true });
await mkdir("public/images", { recursive: true });
const only = process.argv.slice(2);
let sources = {};
try {
  if (only.length)
    sources = JSON.parse(await readFile("data/sources.json", "utf8"));
} catch {
  /* Initial collection. */
}
for (const [id, query] of Object.entries(queries)) {
  if (only.length && !only.includes(id)) continue;
  try {
    let chosen;
    let detail = {};
    if (directUrls[id]) {
      detail = await fetchDetail(directUrls[id]);
      chosen = {
        id: `web-${new URL(directUrls[id]).pathname.split("/")[2]}`,
        title: detail.title,
        url: directUrls[id],
        image: detail.image,
        source: "下厨房",
        origin: "online",
        rating: null,
        ingredientIds: [],
        ingredientLines: [],
        ingredientVerified: false,
      };
    } else {
      const result = await searchSource(query);
      chosen =
        id === "salmonAsparagus"
          ? result.recipes.find((item) => item.url.includes("107743616"))
          : id === "chickenChoy"
            ? result.recipes.find((item) => /菜心.*鸡胸.*炒饭/.test(item.title))
            : result.recipes.find(
                (item) =>
                  !/蛋糕|豆腐|炒饭|焖饭|汤饭|粥|猪肝|鸡胗/.test(item.title),
              ) || result.recipes[0];
    }
    if (!chosen) {
      console.log(`${id}: no results`);
      continue;
    }
    if (!Object.keys(detail).length)
      try {
        detail = await fetchDetail(chosen.url);
      } catch {
        /* Search result remains a valid source link. */
      }
    const photo = detail.image || chosen.image;
    if (photo) {
      const photoUrl = new URL(photo);
      photoUrl.search = "imageView2/1/w/800/h/560/interlace/1/q/85";
      const response = await fetch(photoUrl, {
        signal: AbortSignal.timeout(15000),
      });
      if (
        response.ok &&
        response.headers.get("content-type")?.startsWith("image/")
      ) {
        await writeFile(
          `public/images/${id}.jpg`,
          Buffer.from(await response.arrayBuffer()),
        );
        chosen.localImage = `/images/${id}.jpg`;
      }
    }
    sources[id] = {
      ...chosen,
      ...detail,
      checkedAt: new Date().toISOString(),
      query: query.join(" "),
    };
    console.log(`${id}: ${chosen.title}`);
  } catch (error) {
    console.log(`${id}: ${error.message}`);
  }
}
await writeFile("data/sources.json", `${JSON.stringify(sources, null, 2)}\n`);
console.log(`Saved ${Object.keys(sources).length} source records`);
