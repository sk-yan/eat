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
      portion("leg", 220, "cooked", 300),
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
      portion("leg", 100, "cooked", 137),
      2,
    ),
    dinner: meal(
      "卤鸡腿配西兰花口蘑",
      "braise",
      "braisedLeg",
      portion("leg", 190, "cooked", 260),
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
      portion("leg", 220, "cooked", 300),
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
    batch: "一批取牛腱600g、带骨琵琶腿约1.6-1.9kg；不是这一餐全部吃掉。",
    steps: [
      "牛腱焯水后放高压锅，加姜、八角1个、香叶1-2片、生抽15-20ml、老抽3-5ml。水量和装量按机型说明。",
      "用本机牛肉程序；支持手动计时的机型，上压后约25-35分钟可作为起点。肉块大小和压力会影响时间，必须完全泄压再开盖。",
      "熟牛腱取出分浅盒。当天卤汁转珐琅锅煮开，再放鸡腿小火煮约20-30分钟；最厚处靠近骨头但不碰骨的位置至少74℃。",
      "鸡腿去皮去骨，分成熟肉220g、100g、190g、220g四份；100g那份和牛腱同餐。牛腱本周用熟肉约150g；其余按实际成品分装冷冻。",
      "牛腱和鸡腿不从头到尾一起高压。熟肉及时浅份冷却入冰箱，不在卤汁里室温过夜；卤汁不当汤喝，也不大量拌饭。",
    ],
  },
  chicken: {
    title: "蒜香 / 黑椒鸡胸",
    tool: "空气炸锅或铁锅",
    batch: "鸡胸全部并入午晚餐，共1190g：260g、90g、300g、280g、260g。",
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
    batch: "本周虾仁两份，解冻沥水后260g和280g。",
    steps: [
      "按包装在冰箱冷藏解冻，沥水后称本餐虾仁。先确认包装是生虾还是熟冻虾，分别按包装加热要求处理。",
      "菠菜焯熟；芦笋去老根切段；口蘑与洋葱切好。按当日配菜组合先将蔬菜炒熟。",
      "锅中少油，将生虾仁炒至通体不透明、肉质紧实，再和熟蔬菜拌匀。不要依赖固定分钟数判断所有大小的虾。",
      "按本餐用量配熟饭和100g土豆。当天吃的及时冷藏，后半周份量及时分装冷冻。",
    ],
  },
  salmon: {
    title: "香煎三文鱼",
    tool: "铁锅或空气炸锅",
    batch: "本周三文鱼220g一份，搭鸡胸90g；三文鱼本身含脂肪，按表内少油烹调。",
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
    batch: "本餐黄牛嫩肉250g，青红椒200g；大火快炒，烹调油总量10g。",
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
    batch: "去皮去骨生鸡腿肉约300g，做熟并称220g；若从带骨琵琶腿取肉，需按实际出肉率多备。鲜香菇100g。",
    steps: [
      "琵琶腿先去皮去骨，称净生肉约300g后切块；加生抽5ml、姜丝、淀粉4g和本餐油3g抓匀，冷藏腌15分钟。鲜香菇切片。",
      "鸡肉与香菇摊在浅盘中，不要堆得过厚。蒸锅水开后上锅蒸，约15-20分钟只作起点。",
      "最厚鸡块中心至少74℃后出锅，熟鸡肉称220g。娃娃菜150g和胡萝卜50g另外蒸熟或焯熟。",
      "汤汁少量拌菜即可，不额外浇油。装盒后及时冷却，后半周份量当天冷冻。",
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
    id: "divide",
    title: "先分装，余量直接冷冻",
    text: "牛腱留600g做一批；琵琶腿带骨约1.6-1.9kg。鸡胸按260g、90g、300g、280g、260g分装，共1190g；虾仁分260g和280g；三文鱼220g；黄牛嫩肉250g。鳜鱼留到周六现买现蒸。",
  },
  {
    id: "braise",
    title: "牛腱先卤，鸡腿后卤",
    text: "高压锅先做牛腱，完全泄压后捞出。卤汁转珐琅锅，再把鸡腿煮熟。鸡腿去皮去骨，分熟肉220g、100g、190g、220g；牛腱取熟肉150g，和100g鸡腿装进周三午餐。",
  },
  {
    id: "rice",
    title: "按天分装熟饭1245g",
    text: "全周熟饭1245g：周一/三/五午餐各130g，周二/六/日各105g，周四100g；晚餐除周六80g外均为60g。另准备红薯300g、土豆400g，每份100g。干米按实际出饭率调整。",
  },
  {
    id: "cook",
    title: "分批做主菜和蔬菜",
    text: "空气炸锅分批做鸡胸；90g鸡胸和周二三文鱼装一盒。铁锅做虾仁、小炒黄牛肉；蒸锅做香菇滑鸡。牛排可做熟冷冻，或周四晚做好周五带走。周六鳜鱼在家现蒸。",
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
  "本周牛油果油按餐称量，共约109g：每天合计5-25g。三文鱼、牛排和小炒牛肉本身含脂肪，相应控制用油；低碳不等于油无限量。",
  "冷冻蓝莓先看包装。需加热的按标签处理；即食属性不清楚时，可采用更保守做法：充分煮沸至少1分钟，迅速降温后拌酸奶。",
  "鸡蛋和牛奶、酸奶蓝莓可以调整到不同时间吃。酸奶早餐仍搭配2个鸡蛋，牛奶移到下午；周一、三、五多出的1杯酸奶可移到实际训练日，全天不重复加量。",
  "早餐后仍饿时，可从余量里加红薯100-150g或适量糙米饭，并计入实际用量。这是一人份菜单起点，不是精确热量或治疗处方。",
  "本版蛋白质按通用食物成分估算，实际以牛奶、酸奶和肉类包装营养表及可食重量为准。如医生要求限制蛋白，以医生或注册营养师给出的目标为准。",
  "逐餐热量按4×蛋白质+9×脂肪+4×碳水计算；酱油、淀粉等少量调料暂未计入。牛肋条和牛排肥瘦差异最大，包装标签或实物肥瘦应优先于页面估值。",
  "本版没有独立蛋白补剂。蛋白质已经并入午晚餐；牛腱餐额外搭熟鸡腿100g，周二三文鱼搭鸡胸90g。不要在此基础上再重复加蛋白粉。",
  "已购牛肋条2.1kg本周不安排，按一餐用量分袋冷冻；后续替换黄牛肉、牛排或鸡肉餐时再重新核算脂肪与总热量。",
];

export const usageNotes = {
  breast: "全部并入午晚餐，共生重1190g；余约1.41kg分袋冷冻。",
  leg: "净生肉当量约997g，装盒熟肉共730g；备带骨约1.6-1.9kg，以实际出肉率为准。",
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
