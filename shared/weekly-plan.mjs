export const week = {
  start: "2026-09-07",
  end: "2026-09-13",
  label: "9月7日 - 9月13日",
  servings: 1,
};

const portion = (
  id,
  grams,
  basis = "raw",
  rawEquivalent = grams,
  countHint = "",
) => ({
  id,
  grams,
  basis,
  rawEquivalent,
  countHint,
});
const meal = (
  title,
  guide,
  imageKey,
  meat,
  vegetables,
  rice,
  starch = null,
  extraProtein = null,
  oil = 0,
) => ({
  title,
  guide,
  imageKey,
  meat,
  vegetables: vegetables.map(([id, grams]) => portion(id, grams)),
  rice,
  starch,
  extraProtein,
  oil,
});

export const days = [
  {
    id: "mon",
    label: "周一",
    date: "9月7日",
    packed: true,
    breakfast: "milk",
    extraYogurt: true,
    lunch: meal(
      "卤鸡腿配菜心",
      "braise",
      "braisedLeg",
      portion("leg", 220, "cooked", 300, "约2只中大琵琶腿"),
      [
        ["choy", 250],
        ["carrot", 50],
      ],
      130,
      null,
      null,
      10,
    ),
    dinner: meal(
      "蒜香鸡胸配菜心口蘑",
      "chicken",
      "chickenMushroom",
      portion("breast", 260),
      [
        ["choy", 250],
        ["mushroom", 50],
      ],
      60,
      portion("sweet", 100),
      null,
      10,
    ),
  },
  {
    id: "tue",
    label: "周二",
    date: "9月8日",
    packed: true,
    breakfast: "yogurt",
    extraYogurt: false,
    lunch: meal(
      "菠菜菌菇虾仁",
      "shrimp",
      "shrimpMushroom",
      portion("shrimp", 260),
      [
        ["spinach", 150],
        ["mushroom", 100],
        ["onion", 50],
      ],
      105,
      null,
      null,
      7,
    ),
    dinner: meal(
      "芦笋口蘑三文鱼拼鸡胸",
      "salmon",
      "salmonAsparagus",
      portion("salmon", 220),
      [
        ["asparagus", 200],
        ["mushroom", 100],
      ],
      60,
      portion("potato", 100),
      portion("breast", 90),
      7,
    ),
  },
  {
    id: "wed",
    label: "周三",
    date: "9月9日",
    packed: true,
    breakfast: "milk",
    extraYogurt: true,
    lunch: meal(
      "卤牛腱拼鸡腿配娃娃菜",
      "braise",
      "beefShank",
      portion("shank", 150, "cooked", 225),
      [
        ["baby", 200],
        ["carrot", 100],
      ],
      130,
      null,
      portion("leg", 100, "cooked", 137, "约1只中大琵琶腿"),
      2,
    ),
    dinner: meal(
      "卤鸡腿配西兰花口蘑",
      "braise",
      "braisedLeg",
      portion("leg", 190, "cooked", 260, "约2只中等琵琶腿"),
      [
        ["broccoli", 200],
        ["mushroom", 100],
      ],
      60,
      portion("sweet", 100),
      null,
      3,
    ),
  },
  {
    id: "thu",
    label: "周四",
    date: "9月10日",
    packed: true,
    breakfast: "yogurt",
    extraYogurt: false,
    lunch: meal(
      "小炒黄牛肉",
      "stirBeef",
      "stirBeef",
      portion("stirBeef", 250),
      [
        ["pepper", 200],
        ["onion", 50],
        ["mushroom", 50],
      ],
      100,
      null,
      null,
      10,
    ),
    dinner: meal(
      "黑椒鸡胸配菠菜",
      "chicken",
      "chickenMushroom",
      portion("breast", 300),
      [
        ["spinach", 150],
        ["carrot", 100],
        ["onion", 50],
      ],
      60,
      portion("potato", 100),
      null,
      5,
    ),
  },
  {
    id: "fri",
    label: "周五",
    date: "9月11日",
    packed: true,
    breakfast: "milk",
    extraYogurt: true,
    lunch: meal(
      "煎牛排配双色蔬菜",
      "steak",
      "steakMushroom",
      portion("steak", 240),
      [
        ["baby", 200],
        ["broccoli", 100],
      ],
      130,
      null,
      null,
      8,
    ),
    dinner: meal(
      "芦笋口蘑虾仁",
      "shrimp",
      "shrimpAsparagus",
      portion("shrimp", 280),
      [
        ["asparagus", 200],
        ["mushroom", 100],
      ],
      60,
      portion("potato", 100),
      null,
      7,
    ),
  },
  {
    id: "sat",
    label: "周六",
    date: "9月12日",
    packed: false,
    breakfast: "yogurt",
    extraYogurt: false,
    lunch: meal(
      "香菇滑鸡",
      "shiitakeChicken",
      "shiitakeChicken",
      portion(
        "leg",
        220,
        "cooked",
        300,
        "约3只大或4只小琵琶腿（下锅前）",
      ),
      [
        ["shiitake", 100],
        ["baby", 150],
        ["carrot", 50],
      ],
      105,
      null,
      null,
      3,
    ),
    dinner: meal(
      "清蒸鳜鱼",
      "mandarinFish",
      "mandarinFish",
      portion("mandarinFish", 320, "edible", 650),
      [
        ["broccoli", 250],
        ["mushroom", 50],
      ],
      80,
      portion("sweet", 100),
      null,
      12,
    ),
  },
  {
    id: "sun",
    label: "周日",
    date: "9月13日",
    packed: false,
    breakfast: "milk",
    extraYogurt: false,
    lunch: meal(
      "洋葱鸡胸配娃娃菜",
      "chicken",
      "chickenMushroom",
      portion("breast", 280),
      [
        ["baby", 150],
        ["onion", 100],
        ["carrot", 50],
      ],
      105,
      null,
      null,
      12,
    ),
    dinner: meal(
      "芦笋胡萝卜口蘑鸡胸",
      "chicken",
      "chickenAsparagus",
      portion("breast", 260),
      [
        ["asparagus", 100],
        ["mushroom", 100],
        ["carrot", 100],
      ],
      60,
      portion("potato", 100),
      null,
      13,
    ),
  },
];

export function breakfastLines(day) {
  return day.breakfast === "milk"
    ? ["鸡蛋 2个", "牛奶 250ml"]
    : ["鸡蛋 2个", "无糖酸奶 135g", "蓝莓 150g"];
}
export function snackLines(day) {
  const lines =
    day.breakfast === "milk" ? ["无糖酸奶 135g", "蓝莓 150g"] : ["牛奶 250ml"];
  return day.extraYogurt ? [...lines, "另加酸奶 135g"] : lines;
}

/** @returns {{ rice: number, vegetables: number, foods: Record<string, number>, cooked: Record<string, number> }} */
export function weeklyTotals() {
  const result = { rice: 0, vegetables: 0, foods: {}, cooked: {} };
  const add = (map, id, amount) => {
    map[id] = (map[id] || 0) + amount;
  };
  for (const day of days) {
    add(result.foods, "egg", 2);
    add(result.foods, "milk", 250);
    add(result.foods, "yogurt", day.extraYogurt ? 270 : 135);
    add(result.foods, "blueberry", 150);
    for (const plate of [day.lunch, day.dinner]) {
      result.rice += plate.rice;
      add(result.foods, plate.meat.id, plate.meat.rawEquivalent);
      if (plate.meat.basis === "cooked")
        add(result.cooked, plate.meat.id, plate.meat.grams);
      if (plate.extraProtein) {
        add(
          result.foods,
          plate.extraProtein.id,
          plate.extraProtein.rawEquivalent,
        );
        if (plate.extraProtein.basis === "cooked")
          add(result.cooked, plate.extraProtein.id, plate.extraProtein.grams);
      }
      for (const item of plate.vegetables) {
        result.vegetables += item.grams;
        add(result.foods, item.id, item.grams);
      }
      if (plate.starch) add(result.foods, plate.starch.id, plate.starch.grams);
      add(result.foods, "oil", plate.oil || 0);
    }
  }
  return result;
}

export const guides = {
  braise: {
    title: "牛腱与鸡腿：同卤汁，分阶段",
    tool: "高压锅 + 珐琅锅",
    batch: "一批取牛腱600g、约5只中大琵琶腿；另留3只大或4只小琵琶腿做周六香菇滑鸡。",
    steps: [
      "牛腱焯水后放高压锅，加姜、八角1个、香叶1-2片、生抽15-20ml、老抽3-5ml。水量和装量按机型说明。",
      "用本机牛肉程序；支持手动计时的机型，上压后约25-35分钟可作为起点。肉块大小和压力会影响时间，必须完全泄压再开盖。",
      "熟牛腱取出分浅盒。当天卤汁转珐琅锅煮开，再放鸡腿小火煮约20-30分钟；最厚处靠近骨头但不碰骨的位置至少74℃。",
      "卤好的5只鸡腿按周一2只、周三午1只、周三晚2只分组；去皮去骨后再用熟肉220g、100g、190g校准。牛腱本周用熟肉约150g。",
      "牛腱和鸡腿不从头到尾一起高压。熟肉及时浅份冷却入冰箱，不在卤汁里室温过夜；卤汁不当汤喝，也不大量拌饭。",
    ],
  },
  chicken: {
    title: "蒜香 / 黑椒鸡胸",
    tool: "空气炸锅或铁锅",
    batch: "周末按生重分成260g、90g、300g、280g、260g五袋，共1190g；分别腌好，周一袋冷藏，其余立即冷冻。",
    steps: [
      "周末将鸡胸切成约1-1.5cm薄片。每300g加入低盐生抽5ml、清水15ml、淀粉3g；蒜香袋加蒜末，黑椒袋加黑胡椒，不另外倒油。",
      "隔袋抓匀、压平并排出空气。周一要吃的袋子冷藏，其余立即冷冻；标签写星期、午晚餐和生重。",
      "前一晚从冷冻移到冷藏解冻。下锅前隔袋揉匀，空气炸锅180℃约10-15分钟，中途检查、翻面；也可铁锅少油分散煎炒。",
      "时间只作参考，以鸡肉中心至少74℃为准。接触过生鸡肉的袋内汁液不直接当蘸汁使用。",
      "配菜按本餐清单称重。菜心、菠菜焯熟沥水；芦笋去老根，口蘑切片炒熟。可与熟鸡肉拌匀，也可分开放。",
    ],
  },
  shrimp: {
    title: "蔬菜炒虾仁",
    tool: "铁锅",
    batch: "周末按解冻沥水后的目标重量分成260g和280g两袋；烹调前一晚冷藏解冻，当天再调味。",
    steps: [
      "按包装在冰箱冷藏解冻，沥水后称本餐虾仁。先确认包装是生虾还是熟冻虾，分别按包装加热要求处理。",
      "菠菜焯熟；芦笋去老根切段；口蘑与洋葱切好。按当日配菜组合先将蔬菜炒熟。",
      "锅中少油，将生虾仁炒至通体不透明、肉质紧实，再和熟蔬菜拌匀。不要依赖固定分钟数判断所有大小的虾。",
      "按本餐用量配熟饭和100g土豆。现炒完成后分进第二天对应饭盒，及时冷却冷藏，不把熟虾周末做好放到周五。",
    ],
  },
  salmon: {
    title: "香煎三文鱼",
    tool: "铁锅或空气炸锅",
    batch: "周末将三文鱼220g生冻分装；搭配的鸡胸90g按鸡胸腌料提前腌好后冷冻。周一早上一起转冷藏。",
    steps: [
      "三文鱼冷藏解冻后吸干表面水分，称220g，用少量盐、黑胡椒和蒜调味，静置约10分钟。另称鸡胸90g切薄片。",
      "铁锅薄薄抹油，中火先煎鱼皮面，再翻面煎熟；或按空气炸锅说明加热。厚度不同，不用固定分钟数替代熟度检查。",
      "鸡胸用铁锅或空气炸锅做熟，中心至少74℃。芦笋去老根、口蘑切片，或将西兰花切小朵；使用本餐已经计入的油量将蔬菜炒熟。",
      "带饭的三文鱼按鱼肉中心至少63℃熟制，及时浅盒冷却；在公司作为剩餐复热到74℃。不采用原菜谱保留粉色中心的做法。",
    ],
  },
  stirBeef: {
    title: "小炒黄牛肉",
    tool: "铁锅",
    batch: "周末只把黄牛嫩肉250g生冻分装，不提前腌；周三早上转冷藏，周三晚现腌15分钟后大火快炒。",
    steps: [
      "黄牛嫩肉逆纹切薄片，加生抽5ml、淀粉3g、清水5ml和油3g抓匀，冷藏腌15分钟。青红椒切圈，洋葱和口蘑切片。",
      "铁锅充分预热，加油3g，下牛肉快速滑散。带饭版本炒至完全变色后立即盛出，不保留半生状态。",
      "锅中加入剩余4g油，炒香姜蒜和青红椒，再下洋葱、口蘑炒熟。不能吃辣时用不辣的青红甜椒。",
      "牛肉回锅快速翻匀，配熟糙米饭100g。及时浅盒冷却，复热时翻拌至中心至少74℃。",
    ],
  },
  shiitakeChicken: {
    title: "香菇滑鸡",
    tool: "蒸锅",
    batch: "周末另留3只大或4只小琵琶腿，不与5只卤鸡腿混在一起；去皮去骨净生肉目标300g，周五晚转冷藏，周六现腌现蒸。",
    steps: [
      "琵琶腿先去皮去骨，称净生肉约300g后切块；加生抽5ml、姜丝、淀粉4g和本餐油3g抓匀，冷藏腌15分钟。鲜香菇切片。",
      "鸡肉与香菇摊在浅盘中，不要堆得过厚。蒸锅水开后上锅蒸，约15-20分钟只作起点。",
      "最厚鸡块中心至少74℃后出锅，熟鸡肉称220g。娃娃菜150g和胡萝卜50g另外蒸熟或焯熟。",
      "汤汁少量拌菜即可，不额外浇油。周六在家现做现吃，不需要周末提前蒸熟。",
    ],
  },
  mandarinFish: {
    title: "清蒸鳜鱼",
    tool: "蒸锅 + 铁锅",
    batch: "买处理前约600-700g的整条鳜鱼；营养按约320g可食鱼肉计算，实际出肉率以称重为准。",
    steps: [
      "请摊主去鳞、去鳃和内脏。回家后清理血水、吸干，鱼身划浅刀，放姜片和葱段；不需要长时间盐腌。",
      "蒸锅水开后放鱼，大火蒸约8-12分钟只作起点。鱼大小不同，以最厚处达到至少63℃、鱼肉易分离为准。",
      "倒掉过多蒸汁，淋少量蒸鱼豉油。将本餐12g油中的一部分烧热后淋葱姜，其余用于西兰花和口蘑。",
      "在家现吃，去骨后按约320g可食鱼肉计入本餐。鱼刺较多，不建议整条鱼装进工作日便当盒。",
    ],
  },
  rib: {
    title: "洋葱焖牛肋条",
    tool: "珐琅锅或高压锅",
    batch: "本周吃净生肉230g。多做的部分按实际熟成品另行冷冻。",
    steps: [
      "挑去明显肥油；如果带骨，骨头不计入230g净肉。牛肉切块、焯水。",
      "加本餐洋葱、胡萝卜、姜片、少量生抽和水，珐琅锅焖炖至软。高压锅按本机适用肉类程序，水量和装量遵守说明。",
      "口蘑可后放，充分煮熟。撇去浮油，装盒少带油汤。",
      "称本餐熟饭80g。若一次多做，按实际熟成品分装，不把熟肉230g当成生肉230g。",
    ],
  },
  steak: {
    title: "煎牛排",
    tool: "铁锅或空气炸锅",
    batch: "本餐取生肉240g；包装“一份”的克重不固定，不必整块都吃。",
    steps: [
      "按包装冷藏解冻，称240g，吸干表面水分，少量盐与黑胡椒调味。",
      "铁锅薄薄抹油，分面煎熟；时间随厚度变化。整块原切牛排中心至少63℃后静置3分钟。机械嫩化、重组或调理牛排按包装充分加热。",
      "娃娃菜200g、西兰花100g分别炒熟或蒸熟，搭熟饭130g。",
      "带饭不预留半生状态，到公司作为熟剩餐仍需复热到74℃。想保留更好的口感，可以与周末一顿鸡胸交换，在家现煎，周用量不变。",
    ],
  },
};

export const prepTasks = [
  {
    id: "labels",
    title: "先写标签，不靠外观猜肉",
    text: "准备生肉冷冻袋和熟卤肉盒，写清“星期+午/晚+食材+生重/熟重”。例如：周二午虾260g生、周二晚三文鱼220g生、周三午牛腱150g熟+鸡腿100g熟。",
  },
  {
    id: "marinate-breast",
    title: "鸡胸分五袋，提前腌好",
    text: "分周一晚260g、周二晚90g、周四晚300g、周日午280g、周日晚260g。每300g加低盐生抽5ml、清水15ml、淀粉3g，分别加蒜末或黑胡椒；不额外放油。周一袋冷藏，其余压平后立即冷冻。",
  },
  {
    id: "raw-protein",
    title: "其余生肉只分装，不提前腌",
    text: "虾仁分周二午260g、周五晚280g；另分周二晚三文鱼220g、周四午黄牛肉250g、周五午牛排240g。香菇滑鸡留3只大或4只小琵琶腿，去皮去骨净生肉目标300g。这些食材烹调当天再调味。",
  },
  {
    id: "vegetables",
    title: "蔬菜按天归组，但先不洗不切",
    text: "用7个蔬菜袋按周一至周日归组。菜心、菠菜等叶菜保持干燥；口蘑、香菇也不要周末全部切片。胡萝卜、洋葱、薯类可先称重，真正清洗和切配放到烹调当天。",
  },
  {
    id: "braise-shank",
    title: "周末只先卤牛腱",
    text: "牛腱取600g做一锅。熟后称150g，与鸡腿熟肉100g组成周三午餐蛋白盒；其余牛腱按一次食用量冷冻。卤汁不装进便当，也不当汤喝。",
  },
  {
    id: "braise-legs",
    title: "再卤周一、周三的鸡腿",
    text: "卤汁重新煮开后放约5只中大鸡腿，熟透再去皮去骨。按周一2只、周三午1只、周三晚2只分组，再用熟肉220g、100g、190g校准。香菇滑鸡的3-4只必须另袋冷冻。",
  },
  {
    id: "store",
    title: "熟卤肉冷却，生肉立即归位",
    text: "周一卤鸡腿盒放冷藏；周三两盒及多余卤肉分浅盒及时冷冻。所有后半周生肉袋立即冷冻。前一晚只把次日要做的肉移到冷藏，绝不放台面解冻。",
  },
];

export const mealTiming = {
  mon: {
    lunch: "周末卤好并按熟重220g分盒；周一直接搭菜装盒",
    dinner: "周末已腌好；周一早晨直接做，来不及可在周日晚完成",
  },
  tue: {
    lunch: "周一早上冷藏解冻，周二早晨现炒；也可周一晚完成",
    dinner: "鸡胸周末已腌好；周一早上与三文鱼一起转冷藏",
  },
  wed: {
    lunch: "周末卤好后冷冻；周二晚转冷藏，周三直接搭菜",
    dinner: "周末卤好后冷冻；周二晚转冷藏，周三直接搭菜",
  },
  thu: {
    lunch: "周三早上冷藏解冻，周四早晨现腌快炒；也可周三晚完成",
    dinner: "鸡胸周末已腌好；周三早上转冷藏，周四早晨直接做",
  },
  fri: {
    lunch: "周四早上冷藏解冻，周五早晨现煎；也可周四晚完成",
    dinner: "周四早上冷藏解冻，周五早晨现炒；也可周四晚完成",
  },
  sat: {
    lunch: "周五晚冷藏解冻，周六现腌现蒸",
    dinner: "周六现买现蒸，不提前冷冻熟鱼",
  },
  sun: {
    lunch: "周末已腌好；周六晚冷藏解冻，周日直接做",
    dinner: "周末已腌好；周六晚冷藏解冻，周日直接做",
  },
};

export const dailyCookPlan = [
  {
    id: "cook-mon",
    day: "周一",
    when: "周一早晨；不想早起可周日晚",
    thaw: "标为“周一晚”的鸡胸260g留冷藏；周一午约2只卤鸡腿已经周末做好，去皮去骨熟肉目标220g。",
    marinate: "鸡胸已经周末腌好，烹调前隔袋揉匀即可；卤鸡腿不再腌。",
    cook: "空气炸锅180℃做鸡胸约10-15分钟至中心74℃；菜心500g、胡萝卜50g、口蘑50g分两餐炒或焯。",
    pack: "午盒：鸡腿220g+饭130g；晚盒：鸡胸260g+饭60g+红薯100g。每盒蔬菜300g。",
  },
  {
    id: "cook-tue",
    day: "周二",
    when: "周二早晨；不想早起可周一晚",
    thaw: "周一早上将周二午虾260g、周二晚三文鱼220g和鸡胸90g从冷冻移到冷藏。",
    marinate: "虾仁沥水后再调味；三文鱼当天调味10分钟；鸡胸90g已经周末腌好。",
    cook: "铁锅炒虾仁；三文鱼用铁锅或空气炸锅做到中心63℃，鸡胸做到74℃。菠菜、芦笋、口蘑和洋葱当天切炒。",
    pack: "午盒：虾260g+饭105g；晚盒：三文鱼220g+鸡胸90g+饭60g+土豆100g。各配蔬菜300g。",
  },
  {
    id: "cook-wed",
    day: "周三",
    when: "周三早晨；不想早起可周二晚",
    thaw: "周二晚把周三午牛腱150g+约1只鸡腿、周三晚约2只鸡腿两盒从冷冻转冷藏。",
    marinate: "卤肉无需重新腌制，也不再放卤汁。",
    cook: "只需现做娃娃菜、胡萝卜、西兰花和口蘑；卤肉搭配时保持冷藏，第二天在公司统一复热。",
    pack: "午盒：牛腱150g+约1只鸡腿（熟肉100g）+饭130g；晚盒：约2只鸡腿（熟肉190g）+饭60g+红薯100g。各配蔬菜300g。",
  },
  {
    id: "cook-thu",
    day: "周四",
    when: "周四早晨；不想早起可周三晚",
    thaw: "周三早上将周四午黄牛肉250g、周四晚鸡胸300g从冷冻移到冷藏。",
    marinate: "黄牛肉逆纹切片后现腌15分钟；鸡胸300g已经周末腌好，解冻后直接做。",
    cook: "铁锅大火快炒黄牛肉、青红椒、洋葱和口蘑；鸡胸用空气炸锅或铁锅做到中心74℃，菠菜等蔬菜现做。",
    pack: "午盒：黄牛肉250g+饭100g；晚盒：鸡胸300g+饭60g+土豆100g。各配蔬菜300g。",
  },
  {
    id: "cook-fri",
    day: "周五",
    when: "周五早晨；不想早起可周四晚",
    thaw: "周四早上将周五午牛排240g、周五晚虾仁280g从冷冻移到冷藏。",
    marinate: "牛排擦干后只放少量盐和黑胡椒；虾仁沥水后再调味，不在周末提前腌。",
    cook: "牛排按产品类型充分煎熟；铁锅现炒虾仁、芦笋和口蘑。带饭牛排不保留半生，次日复热至74℃。",
    pack: "午盒：牛排240g+饭130g；晚盒：虾280g+饭60g+土豆100g。各配蔬菜300g。",
  },
  {
    id: "cook-sat",
    day: "周六",
    when: "当天现做",
    thaw: "周五晚将周六午3只大或4只小鸡腿转冷藏；去皮去骨净生肉目标300g。鳜鱼周六买600-700g整鱼。",
    marinate: "鸡腿加姜丝、生抽和淀粉现腌15分钟；鳜鱼只放葱姜，不长时间盐腌。",
    cook: "香菇滑鸡水开后蒸约15-20分钟至鸡肉74℃；鳜鱼现蒸至最厚处63℃。",
    pack: "午餐配饭105g；晚餐按可食鱼肉约320g，配饭80g+红薯100g。两餐都在家吃。",
  },
  {
    id: "cook-sun",
    day: "周日",
    when: "当天现做",
    thaw: "周六晚将周日午鸡胸280g、周日晚鸡胸260g转冷藏。",
    marinate: "两份鸡胸已经周末分别腌成蒜香和黑椒味；冷藏解冻后隔袋揉匀即可。",
    cook: "空气炸锅或铁锅分两批做到中心74℃；娃娃菜、洋葱、胡萝卜、芦笋和口蘑当天处理。",
    pack: "午餐配饭105g；晚餐配饭60g+土豆100g。两餐各有蔬菜300g。",
  },
];

export const riceBatches = [
  {
    when: "周日晚",
    grams: 355,
    portions: "周一130g+60g；周二105g+60g。周二两份冷却后直接冷冻。",
  },
  {
    when: "周二晚",
    grams: 350,
    portions: "周三130g+60g；周四100g+60g。周四两份冷却后直接冷冻。",
  },
  {
    when: "周四晚",
    grams: 375,
    portions: "周五130g+60g；周六105g+80g。周六两份冷却后直接冷冻。",
  },
  {
    when: "周六晚",
    grams: 165,
    portions: "周日105g+60g。",
  },
];

export const storageNotes = [
  "饭是熟重；未另标的肉、虾、蔬菜、薯类为烹调前可食重量。卤鸡腿按去皮去骨熟肉称；卤牛腱也是熟肉重量，生熟换算仅为估计。",
  "琵琶腿在操作时按只数：卤约5只，香菇滑鸡另留3只大或4只小。大小不一时仍以去皮去骨后的目标生重或熟重校准。",
  "本周牛油果油按餐称量，共约109g：每天合计5-25g。三文鱼、牛排和小炒牛肉本身含脂肪，相应控制用油；低碳不等于油无限量。",
  "冷冻蓝莓先看包装。需加热的按标签处理；即食属性不清楚时，可采用更保守做法：充分煮沸至少1分钟，迅速降温后拌酸奶。",
  "鸡蛋和牛奶、酸奶蓝莓可以调整到不同时间吃。酸奶早餐仍搭配2个鸡蛋，牛奶移到下午；周一、三、五多出的1杯酸奶可移到实际训练日，全天不重复加量。",
  "早餐后仍饿时，可从余量里加红薯100-150g或适量糙米饭，并计入实际用量。这是一人份菜单起点，不是精确热量或治疗处方。",
  "本版蛋白质按通用食物成分估算，实际以牛奶、酸奶和肉类包装营养表及可食重量为准。如医生要求限制蛋白，以医生或注册营养师给出的目标为准。",
  "逐餐热量按4×蛋白质+9×脂肪+4×碳水计算；酱油、淀粉等少量调料暂未计入。牛肋条和牛排肥瘦差异最大，包装标签或实物肥瘦应优先于页面估值。",
  "本版没有独立蛋白补剂。蛋白质已经并入午晚餐；牛腱餐额外搭熟鸡腿100g，周二三文鱼搭鸡胸90g。不要在此基础上再重复加蛋白粉。",
  "鸡胸五袋可在周末提前腌好：周一袋冷藏，其余立即冷冻。生禽肉在腌料中冷藏不超过2天；前一晚只解冻次日要吃的袋子。",
  "已购牛肋条2.1kg本周不安排，按一餐用量分袋冷冻；后续替换黄牛肉、牛排或鸡肉餐时再重新核算脂肪与总热量。",
];

export const usageNotes = {
  breast: "全部并入午晚餐，共生重1190g；余约1.41kg分袋冷冻。",
  leg: "全周约8只大腿，偏小则9只：卤5只，香菇滑鸡另留3只大或4只小；最终按净生肉和熟肉目标校准。",
  shank:
    "生重当量约225g，装盒熟肉约150g。牛腱可卤600g，本周取一份，其余冷冻；其他生肉也冷冻。",
  rib: "去明显肥油后的可食生重230g；若带骨或修脂多，原料消耗更高。",
  steak: "本周生重240g；库存10份的克重未知，余量实际称量。",
  shrimp: "解冻沥水后540g；剩余量需考虑冰衣与沥水损耗。",
  salmon: "周二一份220g；若买大包装，多余部分按份冷冻。",
  stirBeef: "黄牛嫩肉250g；优先买适合快炒的牛里脊或嫩肉片。",
  mandarinFish:
    "整鱼采购约650g，营养按可食鱼肉约320g估算；实际出肉率和摊主处理损耗会变化。",
  shiitake: "鲜香菇100g；包装余量冷藏，尽快用于其他菜。",
  pepper: "青红椒共200g；怕辣可全部使用青红甜椒。",
  egg: "每天2个，正好14个。",
  milk: "共1.75L；开封保存期限另看包装。",
  yogurt: "135g×10杯；周一、三、五各2杯，其余每天1杯。",
  blueberry: "每天150g，共1.05kg；余约310g保持冷冻。",
};
