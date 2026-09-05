export const week = {
  start: "2026-09-07",
  end: "2026-09-13",
  label: "9月7日 - 9月13日",
  servings: 1,
};

const portion = (id, grams, basis = "raw", rawEquivalent = grams) => ({
  id,
  grams,
  basis,
  rawEquivalent,
});
const meal = (
  title,
  guide,
  imageKey,
  meat,
  vegetables,
  rice,
  starch = null,
) => ({
  title,
  guide,
  imageKey,
  meat,
  vegetables: vegetables.map(([id, grams]) => portion(id, grams)),
  rice,
  starch,
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
      portion("leg", 110, "cooked", 150),
      [
        ["choy", 250],
        ["carrot", 50],
      ],
      250,
    ),
    dinner: meal(
      "蒜香鸡胸配菜心口蘑",
      "chicken",
      "chickenMushroom",
      portion("breast", 100),
      [
        ["choy", 250],
        ["mushroom", 50],
      ],
      150,
      portion("sweet", 150),
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
      portion("shrimp", 150),
      [
        ["spinach", 150],
        ["mushroom", 100],
        ["onion", 50],
      ],
      250,
    ),
    dinner: meal(
      "黑椒鸡胸配菠菜",
      "chicken",
      "chickenMushroom",
      portion("breast", 100),
      [
        ["spinach", 150],
        ["carrot", 100],
        ["onion", 50],
      ],
      150,
      portion("potato", 200),
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
      "卤牛腱配娃娃菜",
      "braise",
      "beefShank",
      portion("shank", 100, "cooked", 150),
      [
        ["baby", 200],
        ["carrot", 100],
      ],
      250,
    ),
    dinner: meal(
      "卤鸡腿配西兰花口蘑",
      "braise",
      "braisedLeg",
      portion("leg", 75, "cooked", 100),
      [
        ["broccoli", 200],
        ["mushroom", 100],
      ],
      150,
      portion("sweet", 150),
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
      "洋葱焖牛肋条",
      "rib",
      "beefRib",
      portion("rib", 150),
      [
        ["onion", 150],
        ["carrot", 100],
        ["mushroom", 50],
      ],
      250,
    ),
    dinner: meal(
      "芦笋口蘑鸡胸",
      "chicken",
      "chickenAsparagus",
      portion("breast", 100),
      [
        ["asparagus", 200],
        ["mushroom", 100],
      ],
      150,
      portion("potato", 200),
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
      portion("steak", 150),
      [
        ["baby", 200],
        ["broccoli", 100],
      ],
      250,
    ),
    dinner: meal(
      "芦笋口蘑虾仁",
      "shrimp",
      "shrimpAsparagus",
      portion("shrimp", 100),
      [
        ["asparagus", 200],
        ["mushroom", 100],
      ],
      150,
      portion("potato", 200),
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
      "卤鸡腿配娃娃菜",
      "braise",
      "braisedLeg",
      portion("leg", 110, "cooked", 150),
      [
        ["baby", 200],
        ["carrot", 100],
      ],
      250,
    ),
    dinner: meal(
      "西兰花口蘑鸡胸",
      "chicken",
      "chickenThree",
      portion("breast", 100),
      [
        ["broccoli", 250],
        ["mushroom", 50],
      ],
      150,
      portion("sweet", 150),
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
      portion("breast", 150),
      [
        ["baby", 150],
        ["onion", 100],
        ["carrot", 50],
      ],
      250,
    ),
    dinner: meal(
      "芦笋胡萝卜口蘑鸡胸",
      "chicken",
      "chickenAsparagus",
      portion("breast", 100),
      [
        ["asparagus", 100],
        ["mushroom", 100],
        ["carrot", 100],
      ],
      150,
      portion("potato", 200),
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
      for (const item of plate.vegetables) {
        result.vegetables += item.grams;
        add(result.foods, item.id, item.grams);
      }
      if (plate.starch) add(result.foods, plate.starch.id, plate.starch.grams);
    }
  }
  return result;
}

export const guides = {
  braise: {
    title: "牛腱与鸡腿：同卤汁，分阶段",
    tool: "高压锅 + 珐琅锅",
    batch: "一批取牛腱600g、带骨琵琶腿约700-800g；不是这一餐全部吃掉。",
    steps: [
      "牛腱焯水后放高压锅，加姜、八角1个、香叶1-2片、生抽15-20ml、老抽3-5ml。水量和装量按机型说明。",
      "用本机牛肉程序；支持手动计时的机型，上压后约25-35分钟可作为起点。肉块大小和压力会影响时间，必须完全泄压再开盖。",
      "熟牛腱取出分浅盒。当天卤汁转珐琅锅煮开，再放鸡腿小火煮约20-30分钟；最厚处靠近骨头但不碰骨的位置至少74℃。",
      "鸡腿去皮去骨，按本周三餐分熟肉110g、75g、110g，多余的另冻。牛腱按实际成品分4份，本周用熟肉约100g的一份，其余冷冻。",
      "牛腱和鸡腿不从头到尾一起高压。熟肉及时浅份冷却入冰箱，不在卤汁里室温过夜；卤汁不当汤喝，也不大量拌饭。",
    ],
  },
  chicken: {
    title: "蒜香 / 黑椒鸡胸",
    tool: "空气炸锅或铁锅",
    batch: "工作日鸡胸300g分3份各100g；周末350g分100g、150g、100g。",
    steps: [
      "按本餐生重称鸡胸，切成约1-1.5cm的薄片。蒜香用蒜末，黑椒用黑胡椒；少量生抽、水和淀粉抓匀，冷藏腌约20分钟。",
      "空气炸锅180℃约10-15分钟，中途检查、翻面。或者铁锅少油分散煎炒。时间只作参考，以鸡肉中心至少74℃为准。",
      "配菜按本餐清单称重。菜心、菠菜焯熟沥水；芦笋去老根，口蘑切片炒熟。可与熟鸡肉拌匀，也可分开放。",
      "装入本餐熟饭与薯类，蔬菜合计300g已包含在清单内，不需要再叠加一份。",
    ],
  },
  shrimp: {
    title: "蔬菜炒虾仁",
    tool: "铁锅",
    batch: "本周虾仁两份：解冻沥水后150g、100g。",
    steps: [
      "按包装在冰箱冷藏解冻，沥水后称本餐虾仁。先确认包装是生虾还是熟冻虾，分别按包装加热要求处理。",
      "菠菜焯熟；芦笋去老根切段；口蘑与洋葱切好。按当日配菜组合先将蔬菜炒熟。",
      "锅中少油，将生虾仁炒至通体不透明、肉质紧实，再和熟蔬菜拌匀。不要依赖固定分钟数判断所有大小的虾。",
      "按本餐用量配熟饭和土豆。当天吃的及时冷藏，后半周份量及时分装冷冻。",
    ],
  },
  rib: {
    title: "洋葱焖牛肋条",
    tool: "珐琅锅或高压锅",
    batch: "本周吃净生肉150g。可做300g分2份，一份用这周、一份冻存。",
    steps: [
      "挑去明显肥油；如果带骨，骨头不计入150g净肉。牛肉切块、焯水。",
      "加本餐洋葱、胡萝卜、姜片、少量生抽和水，珐琅锅焖炖至软。高压锅按本机适用肉类程序，水量和装量遵守说明。",
      "口蘑可后放，充分煮熟。撇去浮油，装盒少带油汤。",
      "称本餐熟饭250g。若做两份牛肉，按实际熟成品均分，不把熟肉150g当成生肉150g。",
    ],
  },
  steak: {
    title: "煎牛排",
    tool: "铁锅或空气炸锅",
    batch: "本餐取生肉150g；包装“一份”的克重不固定，不必整块都吃。",
    steps: [
      "按包装冷藏解冻，称150g，吸干表面水分，少量盐与黑胡椒调味。",
      "铁锅薄薄抹油，分面煎熟；时间随厚度变化。整块原切牛排中心至少63℃后静置3分钟。机械嫩化、重组或调理牛排按包装充分加热。",
      "娃娃菜200g、西兰花100g分别炒熟或蒸熟，搭熟饭250g。",
      "带饭不预留半生状态，到公司作为熟剩餐仍需复热到74℃。想保留更好的口感，可以与周末一顿鸡胸交换，在家现煎，周用量不变。",
    ],
  },
};

export const prepTasks = [
  {
    id: "divide",
    title: "先分装，余量直接冷冻",
    text: "牛腱留600g做一批；琵琶腿带骨约700-800g。鸡胸工作日留300g、周末留350g；虾仁分150g和100g。其余生肉及时分袋冷冻，不整周放冷藏。",
  },
  {
    id: "braise",
    title: "牛腱先卤，鸡腿后卤",
    text: "高压锅先做牛腱，完全泄压后捞出。卤汁转珐琅锅，再把鸡腿煮熟。鸡腿去皮去骨，分熟肉110g、75g、110g；牛腱本周取熟肉约100g。",
  },
  {
    id: "rice",
    title: "工作日准备熟饭2kg",
    text: "分5份250g午餐饭、5份150g晚餐饭。另准备红薯生重300g、土豆生重600g。周末再准备熟饭800g、红薯150g、土豆200g；干米按实际出饭率调整。",
  },
  {
    id: "cook",
    title: "分批做主菜和蔬菜",
    text: "空气炸锅做鸡胸；铁锅炒虾和蔬菜；珐琅锅做牛肋条。菜心、菠菜优先安排周一周二。牛排可做熟冷冻，或周四晚做好周五带走。",
  },
  {
    id: "breakfast",
    title: "早餐单独准备",
    text: "工作日先煮10个鸡蛋，冷却后冷藏；余4个生蛋周末再煮。酸奶保留独立杯，蓝莓按每天150g分装。鲜奶按包装开封保存期限取用，不把“量够一周”当作“开封能放一周”。",
  },
  {
    id: "chill",
    title: "做完一批，及时收进冰箱",
    text: "使用浅盒，小份快速降温；熟食室温不超过2小时，超过32℃时不超过1小时。米饭争取1小时内处理，本计划仅留24小时内吃的份量冷藏，其余当天冷冻。",
  },
  {
    id: "carry",
    title: "前夜解冻，早晨保冷带走",
    text: "前一晚把第二天两餐转冷藏。早晨保冷运输，到公司两盒一起冷藏。午餐只热午餐盒，晚餐到晚上再热；复热中心至少74℃，中途翻拌，多处检查。",
  },
];

export const storageNotes = [
  "饭是熟重；未另标的肉、虾、蔬菜、薯类为烹调前可食重量。卤鸡腿按去皮去骨熟肉称；卤牛腱也是熟肉重量，生熟换算仅为估计。",
  "本周每日烹调用油合计约15-20g，所有菜共用，不是每道菜各用15-20g。调味少量，按口味与实际需要调整。",
  "冷冻蓝莓先看包装。需加热的按标签处理；即食属性不清楚时，可采用更保守做法：充分煮沸至少1分钟，迅速降温后拌酸奶。",
  "鸡蛋和牛奶、酸奶蓝莓可以调整到不同时间吃。酸奶早餐仍搭配2个鸡蛋，牛奶移到下午；周一、三、五多出的1杯酸奶可移到实际训练日，全天不重复加量。",
  "早餐后仍饿时，可从余量里加红薯100-150g或适量糙米饭，并计入实际用量。这是一人份菜单起点，不是精确热量或治疗处方。",
];

export const usageNotes = {
  breast: "生重650g；余约1.95kg分袋冷冻。",
  leg: "净生肉当量约400g，装盒熟肉共295g；备带骨约700-800g，以实际出肉率为准。",
  shank:
    "生重当量约150g，装盒熟肉约100g。可卤600g分4份，另3份冷冻；其余生肉也冷冻。",
  rib: "去明显肥油后的可食生重150g；若带骨或修脂多，原料消耗更高。",
  steak: "本周生重150g；库存10份的克重未知，余量实际称量。",
  shrimp: "解冻沥水后250g；剩余量需考虑冰衣与沥水损耗。",
  egg: "每天2个，正好14个。",
  milk: "共1.75L；开封保存期限另看包装。",
  yogurt: "135g×10杯；周一、三、五各2杯，其余每天1杯。",
  blueberry: "每天150g，共1.05kg；余约310g保持冷冻。",
};
