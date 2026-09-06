import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChefHat,
  ClipboardList,
  Clock3,
  Coffee,
  CookingPot,
  Copy,
  Egg,
  Flame,
  Moon,
  Package,
  Printer,
  Refrigerator,
  Sun,
  X,
} from "lucide-react";
import {
  days,
  week,
  breakfastLines,
  snackLines,
  weeklyTotals,
  guides,
  prepTasks,
  storageNotes,
  usageNotes,
  mealTiming,
  dailyCookPlan,
  riceBatches,
} from "../shared/weekly-plan.mjs";
import { ingredients } from "../shared/ingredients.mjs";
import {
  averageMacros,
  breakfastMacros,
  dayMacros,
  mealMacros,
  roundMacros,
  snackMacros,
} from "../shared/nutrition.mjs";
import sources from "../data/sources.json";
import NutritionCalculator from "./NutritionCalculator";
import "./weekly.css";

type Meal = (typeof days)[number]["lunch"];
type Portion = Meal["meat"];
type View = "daily" | "overview" | "prep" | "usage";
type GuideKey = keyof typeof guides;
const totals = weeklyTotals();
const planAverage = roundMacros(averageMacros(days));
const specialNames: Record<string, string> = {
  oil: "牛油果油",
};
const foodName = (id: string) =>
  ingredients.find((item) => item.id === id)?.name || specialNames[id] || id;
const amount = (item: Portion) =>
  `${foodName(item.id)} ${item.grams}g${
    item.basis === "cooked"
      ? "熟肉"
      : item.basis === "edible"
        ? "可食鱼肉"
        : ""
  }${item.countHint ? ` · ${item.countHint}` : ""}`;
const mealProteins = (meal: Meal) => [
  meal.meat,
  ...(meal.extraProtein ? [meal.extraProtein] : []),
];
const mealLines = (meal: Meal) => [
  mealProteins(meal).map(amount).join(" + "),
  meal.vegetables.map(amount).join(" + "),
  `糙米饭 ${meal.rice}g熟重${meal.starch ? ` + ${amount(meal.starch)}` : ""}`,
  `牛油果油 ${meal.oil}g`,
];
const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

function MacroStrip({
  value,
  compact = false,
}: {
  value: ReturnType<typeof roundMacros>;
  compact?: boolean;
}) {
  return (
    <div
      className={`macro-strip ${compact ? "compact" : ""}`}
      aria-label={`热量${value.calories}千卡，蛋白质${value.protein}克，脂肪${value.fat}克，碳水${value.carbs}克`}
    >
      <span>
        <b>{value.calories}</b> kcal
      </span>
      <span className="macro-p">
        <b>P {value.protein}</b>g
      </span>
      <span className="macro-f">
        <b>F {value.fat}</b>g
      </span>
      <span className="macro-c">
        <b>C {value.carbs}</b>g
      </span>
    </div>
  );
}

function MealCard({
  meal,
  dinner,
  packed,
  timing,
  onOpen,
}: {
  meal: Meal;
  dinner?: boolean;
  packed: boolean;
  timing: string;
  onOpen: () => void;
}) {
  const source = sources[meal.imageKey as keyof typeof sources];
  const macros = roundMacros(mealMacros(meal));
  return (
    <article className="week-meal">
      <div className="week-meal-header">
        <span>
          {dinner ? <Moon size={18} /> : <Sun size={18} />}
          {dinner ? "晚餐" : "午餐"}
        </span>
        <span className="week-meta">{packed ? "公司带饭" : "在家吃"}</span>
      </div>
      <div className="week-meal-intro">
        <div>
          <h3>{meal.title}</h3>
          <span className="week-meta">
            {guides[meal.guide as GuideKey].tool}
          </span>
          <MacroStrip value={macros} compact />
        </div>
        <img
          src={asset(source.localImage)}
          alt={`${meal.title}的主菜做法参考图`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <p className="week-meal-timing">
        <Clock3 size={14} />
        {timing}
      </p>
      <dl className="week-portions">
        <div>
          <dt>主蛋白</dt>
          <dd>
            {mealProteins(meal).map((item) => (
              <span key={item.id}>{amount(item)}</span>
            ))}
            {meal.meat.id === "leg" && <small>去皮、去骨后称</small>}
          </dd>
        </div>
        <div>
          <dt>蔬菜</dt>
          <dd>
            {meal.vegetables.map((item: Portion) => (
              <span key={item.id}>{amount(item)}</span>
            ))}
          </dd>
        </div>
        <div>
          <dt>主食</dt>
          <dd>
            <span>
              糙米饭 {meal.rice}g<em>熟重</em>
            </span>
            {meal.starch && <span>{amount(meal.starch)}</span>}
          </dd>
        </div>
      </dl>
      <div className="week-meal-footer">
        <a href={source.url} target="_blank" rel="noreferrer">
          配图参考 · 原作者
          <ArrowUpRight size={13} />
        </a>
        <button className="week-recipe-button" onClick={onOpen}>
          本餐怎么做
          <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}

function GuideDialog({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const guide = guides[meal.guide as GuideKey];
  const macros = roundMacros(mealMacros(meal));
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="week-dialog"
      aria-label={`${meal.title}做法`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <header>
        <div>
          <span className="week-meta">{guide.tool}</span>
          <h2>{meal.title}</h2>
        </div>
        <button
          className="week-icon"
          aria-label="关闭做法"
          title="关闭做法"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </header>
      <div className="week-dialog-body">
        <h3>这顿先称好</h3>
        <MacroStrip value={macros} />
        <ul className="week-meal-lines">
          {mealLines(meal).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <h3>{guide.title}</h3>
        <p className="week-batch">{guide.batch}</p>
        <ol className="week-recipe-steps">
          {guide.steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <p className="week-note">
          温度、肉块厚度、装载量和设备型号会影响用时。按本餐份量盛出或装盒，不把批量烹饪的全部成品算进一顿。
        </p>
      </div>
    </dialog>
  );
}

function Overview({ onOpen }: { onOpen?: (meal: Meal) => void }) {
  return (
    <div className="week-table-wrap">
      <table className="week-overview">
        <caption>9月7日至13日 · 一人份周食谱</caption>
        <thead>
          <tr>
            <th>日期</th>
            <th>早餐与加餐</th>
            <th>午餐</th>
            <th>晚餐</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.id}>
              <th scope="row">
                {day.label}
                <small>{day.date}</small>
              </th>
              <td>
                <strong>{breakfastLines(day).join(" + ")}</strong>
                <p className="week-snack-text">
                  加餐：{snackLines(day).join(" + ")}
                </p>
                <MacroStrip
                  value={roundMacros(dayMacros(day))}
                  compact
                />
              </td>
              {[day.lunch, day.dinner].map((meal, index) => (
                <td key={index}>
                  {onOpen ? (
                    <button onClick={() => onOpen(meal)}>
                      {meal.title}
                      <ArrowUpRight size={13} />
                    </button>
                  ) : (
                    <strong>{meal.title}</strong>
                  )}
                  {mealLines(meal).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p className="week-timing-text">
                    {mealTiming[day.id as keyof typeof mealTiming][
                      index === 0 ? "lunch" : "dinner"
                    ]}
                  </p>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WeekPlan({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const [view, setView] = useState<View>("daily");
  const [dayId, setDayId] = useState(() => {
    const id = new URLSearchParams(window.location.search).get("day");
    return days.find((day) => day.id === id)?.id || "mon";
  });
  const [detail, setDetail] = useState<Meal | null>(null);
  const [toast, setToast] = useState("");
  const [done, setDone] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem(`weekly-prep-${week.start}`) || "[]",
      );
      return Array.isArray(value)
        ? value.filter(
            (id): id is string =>
              typeof id === "string" &&
              prepTasks.some((task) => task.id === id),
          )
        : [];
    } catch {
      return [];
    }
  });
  const day = days.find((item) => item.id === dayId) || days[0];
  const currentDayMacros = roundMacros(dayMacros(day));
  const currentBreakfastMacros = roundMacros(breakfastMacros(day));
  const currentSnackMacros = roundMacros(snackMacros(day));
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);
  function selectDay(id: string) {
    setDayId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("day", id);
    if (!standalone) url.searchParams.set("week", "1");
    window.history.replaceState(null, "", url);
  }
  function toggleTask(id: string) {
    const next = done.includes(id)
      ? done.filter((item) => item !== id)
      : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(`weekly-prep-${week.start}`, JSON.stringify(next));
    } catch {
      setToast("当前浏览器无法保存勾选记录");
    }
  }
  async function share() {
    const url = new URL(window.location.href);
    url.searchParams.set("day", dayId);
    if (!standalone) url.searchParams.set("week", "1");
    try {
      await navigator.clipboard.writeText(url.href);
      setToast("食谱链接已复制");
    } catch {
      setToast("请从浏览器地址栏分享这个网址");
    }
  }
  return (
    <main className="week-page">
      <header className="week-heading">
        <div>
          <p className="week-eyebrow">{week.label} · 2026</p>
          <h1>一周食谱</h1>
          <p className="week-heading-note">
            一人份 · 减脂低碳高蛋白 · 工作日带饭
          </p>
        </div>
        <div className="week-heading-actions">
          <button
            className="week-icon"
            onClick={share}
            title="复制食谱链接"
            aria-label="复制食谱链接"
          >
            <Copy size={20} />
          </button>
          <button
            className="week-icon"
            onClick={() => window.print()}
            title="打印整周食谱"
            aria-label="打印整周食谱"
          >
            <Printer size={20} />
          </button>
        </div>
      </header>
      <div className="week-summary">
        <span>
          <Flame size={17} />
          <b>{planAverage.calories}</b>kcal / 天
        </span>
        <span>
          <b>P {planAverage.protein}g</b>蛋白质
        </span>
        <span>
          <b>F {planAverage.fat}g</b>脂肪
        </span>
        <span>
          <b>C {planAverage.carbs}g</b>碳水
        </span>
      </div>
      <p className="week-protein-balance">
        <strong>主菜分配：</strong>
        牛肉3顿、三文鱼1顿、鳜鱼1顿、虾仁2顿、去皮鸡腿3顿、鸡胸4顿。蛋白质全部并入早餐和午晚餐，不另喝蛋白粉。
      </p>
      <NutritionCalculator plan={planAverage} />
      <nav className="week-views" aria-label="周食谱视图">
        {(
          [
            { id: "daily", label: "每天吃什么", icon: CalendarDays },
            { id: "overview", label: "整周总览", icon: ClipboardList },
            { id: "prep", label: "周末备餐", icon: ChefHat },
            { id: "usage", label: "本周用量", icon: Package },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            aria-pressed={view === item.id}
            className={view === item.id ? "active" : ""}
            onClick={() => setView(item.id)}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="week-screen">
        {view === "daily" && (
          <>
            <nav className="week-days" aria-label="选择星期">
              {days.map((item) => (
                <button
                  key={item.id}
                  aria-label={`${item.label} ${item.date}`}
                  aria-current={day.id === item.id ? "date" : undefined}
                  className={day.id === item.id ? "active" : ""}
                  onClick={() => selectDay(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>
                    {item.date.replace("9月", "").replace("日", "")}日
                  </span>
                </button>
              ))}
            </nav>
            <section
              className="week-day-macros"
              aria-label={`${day.label}营养估算`}
            >
              <div>
                <span>
                  <Flame size={18} />
                  今日合计
                </span>
                <strong>约{currentDayMacros.calories} kcal</strong>
              </div>
              <MacroStrip value={currentDayMacros} />
              <p>含早餐、加餐、午餐和晚餐；P/F/C为估算值。</p>
            </section>
            <section
              className="week-breakfast"
              aria-label={`${day.label}早餐和加餐`}
            >
              <div>
                <h2>
                  <Egg size={20} />
                  早餐
                </h2>
                <p>{breakfastLines(day).join(" + ")}</p>
                <MacroStrip value={currentBreakfastMacros} compact />
              </div>
              <div>
                <h2>
                  <Coffee size={19} />
                  加餐
                </h2>
                <p>{snackLines(day).join(" + ")}</p>
                <MacroStrip value={currentSnackMacros} compact />
              </div>
            </section>
            <div className="week-meals">
              <MealCard
                meal={day.lunch}
                packed={day.packed}
                timing={
                  mealTiming[day.id as keyof typeof mealTiming].lunch
                }
                onOpen={() => setDetail(day.lunch)}
              />
              <MealCard
                meal={day.dinner}
                dinner
                packed={day.packed}
                timing={
                  mealTiming[day.id as keyof typeof mealTiming].dinner
                }
                onOpen={() => setDetail(day.dinner)}
              />
            </div>
            <p className="week-weight-note">
              饭是熟重；卤肉单独标明熟肉。其余肉、虾、蔬菜、薯类按烹调前可食重量称。鸡腿熟肉先去皮去骨。
            </p>
          </>
        )}
        {view === "overview" && (
          <section className="week-section">
            <h2>七天，一张表</h2>
            <p className="week-note">
              米饭和卤肉为熟重；其余按烹调前可食重量。加餐已计入全天，不重复增加。
            </p>
            <Overview onOpen={setDetail} />
          </section>
        )}
        {view === "prep" && (
          <section className="week-section">
            <div className="week-section-heading">
              <div>
                <h2>周末只分装，再卤牛腱和鸡腿</h2>
                <p className="week-note">
                  鸡胸分袋腌好后立即冷冻；虾、三文鱼、黄牛肉、牛排和香菇滑鸡当天再调味。周末不提前炒熟。
                </p>
              </div>
              <span className="week-progress">
                {done.length}/{prepTasks.length}项已完成
              </span>
            </div>
            <div className="week-prep-policy">
              <div>
                <strong>周末要做</strong>
                <span>称重贴标签、鸡胸腌好冷冻、其他生肉分袋、卤牛腱和鸡腿</span>
              </div>
              <div>
                <strong>周末不做</strong>
                <span>不炒熟鸡胸虾牛肉，不煎鱼和牛排；除鸡胸外不提前腌</span>
              </div>
              <div>
                <strong>每天现做</strong>
                <span>前一晚解冻；鸡胸直接做，其他肉当天调味后装两盒</span>
              </div>
            </div>
            <ol className="week-prep-list">
              {prepTasks.map((task, index) => (
                <li
                  key={task.id}
                  className={done.includes(task.id) ? "done" : ""}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={done.includes(task.id)}
                      onChange={() => toggleTask(task.id)}
                      aria-label={task.title}
                    />
                    <span className="week-task-index">
                      {done.includes(task.id) ? (
                        <Check size={18} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <span>
                      <strong>{task.title}</strong>
                      <span className="week-task-text">{task.text}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ol>
            <button
              className="week-inline-button"
              onClick={() => setDetail(days[2].lunch)}
            >
              <CookingPot size={17} />
              查看牛腱与鸡腿的详细卤法
              <ArrowUpRight size={16} />
            </button>
            <section className="daily-cook-section">
              <div className="daily-cook-heading">
                <h3>每天取哪袋，怎么做</h3>
                <p>优先当天早晨现做；不想早起时，可在前一晚完成并及时冷藏。</p>
              </div>
              <div className="daily-cook-grid">
                {dailyCookPlan.map((item) => (
                  <article className="daily-cook-card" key={item.id}>
                    <header>
                      <strong>{item.day}</strong>
                      <span>{item.when}</span>
                    </header>
                    <dl>
                      <div>
                        <dt>取出</dt>
                        <dd>{item.thaw}</dd>
                      </div>
                      <div>
                        <dt>腌制</dt>
                        <dd>{item.marinate}</dd>
                      </div>
                      <div>
                        <dt>做菜</dt>
                        <dd>{item.cook}</dd>
                      </div>
                      <div>
                        <dt>装盒</dt>
                        <dd>{item.pack}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>
            <section className="rice-batch-section">
              <div className="daily-cook-heading">
                <h3>米饭两天做一次</h3>
                <p>按熟重分盒；第二天以后的份量冷却后直接冷冻。</p>
              </div>
              <div className="rice-batch-grid">
                {riceBatches.map((batch) => (
                  <div key={batch.when}>
                    <strong>{batch.when}</strong>
                    <span>熟饭{batch.grams}g</span>
                    <p>{batch.portions}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>
        )}
        {view === "usage" && (
          <section className="week-section">
            <h2>这周取这些，剩下的留好</h2>
            <p className="week-note">
              按整周菜单汇总，不是重新购买清单。肉类生熟换算、骨头和食材损耗按实际出成率调整。
              浅橙色行为待补买；已购牛肋条本周不安排，分袋冷冻。
            </p>
            <div className="week-table-wrap">
              <table className="week-usage">
                <thead>
                  <tr>
                    <th>食材</th>
                    <th>本周用量</th>
                    <th>分装与留存</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients
                    .filter(
                      (item) => totals.foods[item.id] && item.id !== "oil",
                    )
                    .map((item) => (
                      <tr
                        key={item.id}
                        className={item.quantity === 0 ? "new-item-row" : ""}
                      >
                        <th scope="row">{item.name}</th>
                        <td>
                          {totals.foods[item.id]}
                          {item.unit === "个"
                            ? "个"
                            : item.id === "milk"
                              ? "ml"
                              : "g"}
                          {["leg", "shank"].includes(item.id) && (
                            <small>约，净生肉当量</small>
                          )}
                          {item.id === "mandarinFish" && (
                            <small>约，整鱼采购重</small>
                          )}
                        </td>
                        <td>
                          {usageNotes[item.id as keyof typeof usageNotes] ||
                            (item.category === "vegetable"
                              ? "可食生重；去根、去皮损耗另计。"
                              : "生的可食重量；未计可选早餐加量。")}
                        </td>
                      </tr>
                    ))}
                  <tr>
                    <th scope="row">三色糙米</th>
                    <td>熟饭1245g</td>
                    <td>
                      午餐100-130g、晚餐60-80g；训练量大的当天优先安排130g午餐饭。
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">牛油果油</th>
                    <td>{totals.foods.oil}g</td>
                    <td>每餐已经单独计入，全天5-25g；不额外随手倒油。</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="week-weight-note">
              蔬菜共{totals.vegetables / 1000}
              kg；红薯300g、土豆400g、熟糙米饭1245g。调味料和试吃不在营养估算内。
            </p>
          </section>
        )}
        <section className="week-storage">
          <h2>
            <Refrigerator size={20} />
            分装与食用提醒
          </h2>
          <details>
            <summary>称重、早餐替换和冷冻蓝莓</summary>
            <ul>
              {storageNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </details>
          <p>
            <Clock3 size={17} />
            做熟后及时分浅盒冷藏 /
            冷冻，前夜冷藏解冻；午晚餐分开复热，中心至少74℃。
          </p>
          <div className="week-sources">
            <a
              href="https://fdc.nal.usda.gov/"
              target="_blank"
              rel="noreferrer"
            >
              蛋白质估算来源
              <ArrowUpRight size={12} />
            </a>
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/36057893/"
              target="_blank"
              rel="noreferrer"
            >
              力量训练蛋白证据
              <ArrowUpRight size={12} />
            </a>
            <a
              href="https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures"
              target="_blank"
              rel="noreferrer"
            >
              安全中心温度
              <ArrowUpRight size={12} />
            </a>
            <a
              href="https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety"
              target="_blank"
              rel="noreferrer"
            >
              剩餐储存
              <ArrowUpRight size={12} />
            </a>
            <a
              href="https://www.fsai.ie/consumer-advice/food-safety-and-hygiene/berries-advice-to-boil-imported-frozen-berries"
              target="_blank"
              rel="noreferrer"
            >
              冷冻莓果
              <ArrowUpRight size={12} />
            </a>
          </div>
        </section>
      </div>
      <div className="week-print">
        <Overview />
        <p>
          饭与卤肉为熟重，其他按可食生重；每日总用油5-25g。后半周熟饭菜当天分份冷冻，前夜冷藏解冻，复热中心至少74℃。每餐蔬菜300g已经包含在清单内。
        </p>
      </div>
      {detail && <GuideDialog meal={detail} onClose={() => setDetail(null)} />}
      {toast && (
        <div className="week-toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
