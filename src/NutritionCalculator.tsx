import { useMemo, useState, type FormEvent } from "react";
import {
  Calculator,
  ChevronDown,
  Dumbbell,
  Flame,
  Info,
  LockKeyhole,
  RotateCcw,
  Scale,
} from "lucide-react";
import {
  activityLevels,
  energyTargets,
  intensityLevels,
  roundMacros,
} from "../shared/nutrition.mjs";

type Sex = "male" | "female" | "";
type Draft = {
  sex: Sex;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  activity: string;
  sessions: string;
  strengthMinutes: string;
  cardioMinutes: string;
  intensity: string;
};
type PlanMacros = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

const STORE = "weekly-nutrition-profile-v1";
const blank: Draft = {
  sex: "",
  age: "",
  height: "",
  weight: "",
  targetWeight: "",
  activity: "office",
  sessions: "",
  strengthMinutes: "",
  cardioMinutes: "",
  intensity: "moderate",
};

function loadProfile(): Draft {
  try {
    const data = JSON.parse(localStorage.getItem(STORE) || "null");
    if (!data || typeof data !== "object") return blank;
    return {
      ...blank,
      ...Object.fromEntries(
        Object.keys(blank).map((key) => [
          key,
          typeof data[key] === "string" ? data[key] : blank[key as keyof Draft],
        ]),
      ),
    } as Draft;
  } catch {
    return blank;
  }
}

function numeric(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function parseProfile(draft: Draft) {
  return {
    sex: draft.sex,
    age: numeric(draft.age),
    height: numeric(draft.height),
    weight: numeric(draft.weight),
    targetWeight: draft.targetWeight ? numeric(draft.targetWeight) : Number.NaN,
    activity: draft.activity,
    sessions: numeric(draft.sessions),
    strengthMinutes: numeric(draft.strengthMinutes),
    cardioMinutes: numeric(draft.cardioMinutes),
    intensity: draft.intensity,
  };
}

function validate(profile: ReturnType<typeof parseProfile>) {
  if (!profile.sex) return "请选择生理性别";
  if (!Number.isInteger(profile.age) || profile.age < 18 || profile.age > 80)
    return "年龄请填写18至80岁的整数";
  if (profile.height < 120 || profile.height > 220)
    return "身高请填写120至220cm";
  if (profile.weight < 35 || profile.weight > 250) return "体重请填写35至250kg";
  if (
    !Number.isInteger(profile.sessions) ||
    profile.sessions < 0 ||
    profile.sessions > 14
  )
    return "每周训练次数请填写0至14次";
  if (
    profile.strengthMinutes < 0 ||
    profile.strengthMinutes > 240 ||
    profile.cardioMinutes < 0 ||
    profile.cardioMinutes > 240
  )
    return "单次力量和有氧时间分别填写0至240分钟";
  if (
    Number.isFinite(profile.targetWeight) &&
    (profile.targetWeight < 35 || profile.targetWeight >= profile.weight)
  )
    return "目标体重需低于当前体重且不低于35kg，也可以留空";
  return "";
}

function Difference({
  actual,
  target,
  unit = "g",
}: {
  actual: number;
  target: number;
  unit?: string;
}) {
  const difference = Math.round(actual - target);
  return (
    <span
      className={
        Math.abs(difference) <= (unit === "kcal" ? 120 : 10) ? "macro-ok" : ""
      }
    >
      {difference === 0
        ? "正好"
        : `${difference > 0 ? "+" : ""}${difference}${unit}`}
    </span>
  );
}

export default function NutritionCalculator({ plan }: { plan: PlanMacros }) {
  const [draft, setDraft] = useState<Draft>(loadProfile);
  const [saved, setSaved] = useState<Draft | null>(() => {
    const value = loadProfile();
    return value.sex ? value : null;
  });
  const [error, setError] = useState("");
  const result = useMemo(() => {
    if (!saved) return null;
    const profile = parseProfile(saved);
    return validate(profile) ? null : energyTargets(profile);
  }, [saved]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function calculate(event: FormEvent) {
    event.preventDefault();
    const profile = parseProfile(draft);
    const message = validate(profile);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setSaved(draft);
    try {
      localStorage.setItem(STORE, JSON.stringify(draft));
    } catch {
      setError("计算完成，但当前浏览器无法保存资料");
    }
  }

  function clear() {
    setDraft(blank);
    setSaved(null);
    setError("");
    try {
      localStorage.removeItem(STORE);
    } catch {
      /* Private browsing may disable local storage. */
    }
  }

  const targetMacros = result ? roundMacros(result.macros) : null;
  const menuWeeklyLoss = result
    ? (Math.max(0, result.tdee - plan.calories) * 7) / 7700
    : 0;
  return (
    <section className="nutrition-calculator">
      <div className="calculator-heading">
        <div>
          <span className="calculator-kicker">
            <Flame size={16} />
            减脂低碳高蛋白
          </span>
          <h2>我的摄入与消耗</h2>
          <p>参考 NutriFit Planner 的公式，运动单独计算，避免重复计入。</p>
        </div>
        <span className="local-only">
          <LockKeyhole size={14} />
          仅保存在这个浏览器
        </span>
      </div>
      <form className="calculator-form" onSubmit={calculate}>
        <fieldset className="sex-control">
          <legend>生理性别</legend>
          <label>
            <input
              type="radio"
              name="sex"
              checked={draft.sex === "male"}
              onChange={() => update("sex", "male")}
            />
            男
          </label>
          <label>
            <input
              type="radio"
              name="sex"
              checked={draft.sex === "female"}
              onChange={() => update("sex", "female")}
            />
            女
          </label>
        </fieldset>
        <label>
          年龄
          <input
            aria-label="年龄"
            type="number"
            min="18"
            max="80"
            inputMode="numeric"
            value={draft.age}
            onChange={(event) => update("age", event.target.value)}
            placeholder="岁"
          />
        </label>
        <label>
          身高
          <input
            aria-label="身高"
            type="number"
            min="120"
            max="220"
            inputMode="decimal"
            value={draft.height}
            onChange={(event) => update("height", event.target.value)}
            placeholder="cm"
          />
        </label>
        <label>
          当前体重
          <input
            aria-label="当前体重"
            type="number"
            min="35"
            max="250"
            step="0.1"
            inputMode="decimal"
            value={draft.weight}
            onChange={(event) => update("weight", event.target.value)}
            placeholder="kg"
          />
        </label>
        <label>
          目标体重 <small>可选</small>
          <input
            aria-label="目标体重"
            type="number"
            min="35"
            max="250"
            step="0.1"
            inputMode="decimal"
            value={draft.targetWeight}
            onChange={(event) => update("targetWeight", event.target.value)}
            placeholder="kg"
          />
        </label>
        <label className="select-label">
          非运动日常活动
          <ChevronDown size={15} />
          <select
            aria-label="非运动日常活动"
            value={draft.activity}
            onChange={(event) => update("activity", event.target.value)}
          >
            {activityLevels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          每周训练
          <input
            aria-label="每周训练次数"
            type="number"
            min="0"
            max="14"
            inputMode="numeric"
            value={draft.sessions}
            onChange={(event) => update("sessions", event.target.value)}
            placeholder="次"
          />
        </label>
        <label>
          单次力量
          <input
            aria-label="单次力量分钟"
            type="number"
            min="0"
            max="240"
            inputMode="numeric"
            value={draft.strengthMinutes}
            onChange={(event) => update("strengthMinutes", event.target.value)}
            placeholder="分钟"
          />
        </label>
        <label>
          单次有氧
          <input
            aria-label="单次有氧分钟"
            type="number"
            min="0"
            max="240"
            inputMode="numeric"
            value={draft.cardioMinutes}
            onChange={(event) => update("cardioMinutes", event.target.value)}
            placeholder="分钟"
          />
        </label>
        <label className="select-label">
          训练强度估计
          <ChevronDown size={15} />
          <select
            aria-label="训练强度估计"
            value={draft.intensity}
            onChange={(event) => update("intensity", event.target.value)}
          >
            {intensityLevels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="calculator-submit">
          <button className="calculate-button" type="submit">
            <Calculator size={17} />
            计算目标
          </button>
          {saved && (
            <button className="clear-profile" type="button" onClick={clear}>
              <RotateCcw size={15} />
              清除
            </button>
          )}
        </div>
      </form>
      {error && (
        <p className="calculator-error" role="alert">
          {error}
        </p>
      )}
      {!result ? (
        <div className="calculator-empty">
          <Scale size={24} />
          <p>
            填完基础信息后，这里会显示基础代谢、训练消耗、每日总消耗和P/F/C目标。
          </p>
        </div>
      ) : (
        <div className="calculator-results">
          <div className="energy-cards">
            <article>
              <span>基础代谢 BMR</span>
              <strong>
                {Math.round(result.bmr)}
                <small>kcal</small>
              </strong>
            </article>
            <article>
              <span>休息日总消耗</span>
              <strong>
                {Math.round(result.restDayExpenditure)}
                <small>kcal</small>
              </strong>
            </article>
            <article>
              <span>每次训练净消耗</span>
              <strong>
                {Math.round(result.sessionExercise)}
                <small>kcal</small>
              </strong>
            </article>
            <article>
              <span>训练日总消耗</span>
              <strong>
                {Math.round(result.trainingDayExpenditure)}
                <small>kcal</small>
              </strong>
            </article>
            <article className="energy-primary">
              <span>日均总消耗 TDEE</span>
              <strong>
                {Math.round(result.tdee)}
                <small>kcal</small>
              </strong>
            </article>
            <article className="energy-target">
              <span>建议日均摄入</span>
              <strong>
                {Math.round(result.intake)}
                <small>kcal</small>
              </strong>
            </article>
          </div>
          <div className="target-comparison">
            <div className="target-title">
              <div>
                <Dumbbell size={18} />
                <strong>高蛋白低碳目标</strong>
              </div>
              <span>
                建议摄入约{result.weeklyLoss.toFixed(2)}kg / 周 · 当前菜单约
                {menuWeeklyLoss.toFixed(2)}kg / 周
                {result.estimatedWeeks
                  ? ` · 建议方案约${Math.ceil(result.estimatedWeeks)}周到目标`
                  : ""}
              </span>
            </div>
            <div className="macro-comparison-head">
              <span>项目</span>
              <span>目标</span>
              <span>本周菜单日均</span>
              <span>差值</span>
            </div>
            {[
              ["热量", targetMacros!.calories, plan.calories, "kcal"],
              ["蛋白质 P", targetMacros!.protein, plan.protein, "g"],
              ["脂肪 F", targetMacros!.fat, plan.fat, "g"],
              ["碳水 C", targetMacros!.carbs, plan.carbs, "g"],
            ].map(([label, target, actual, unit]) => (
              <div className="macro-comparison-row" key={String(label)}>
                <strong>{label}</strong>
                <span>
                  {target}
                  {unit}
                </span>
                <span>
                  {actual}
                  {unit}
                </span>
                <Difference
                  actual={Number(actual)}
                  target={Number(target)}
                  unit={String(unit)}
                />
              </div>
            ))}
          </div>
          <p className="calculator-method">
            <Info size={15} />
            BMR使用Mifflin-St
            Jeor；训练消耗采用净MET估算，已扣除静息部分。器械强度、爬坡坡度、心率和日常步数都会造成明显误差，应根据2至3周体重趋势校准。
          </p>
        </div>
      )}
      <div className="calculator-sources">
        <a
          href="https://david131131.github.io/NutriFit-Planner/"
          target="_blank"
          rel="noreferrer"
        >
          参考方案
        </a>
        <a
          href="https://pubmed.ncbi.nlm.nih.gov/2305711/"
          target="_blank"
          rel="noreferrer"
        >
          BMR公式
        </a>
        <a
          href="https://pacompendium.com/adult-compendium/"
          target="_blank"
          rel="noreferrer"
        >
          运动MET
        </a>
        <a
          href="https://pubmed.ncbi.nlm.nih.gov/28642676/"
          target="_blank"
          rel="noreferrer"
        >
          运动蛋白质
        </a>
      </div>
    </section>
  );
}
