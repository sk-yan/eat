import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Camera,
  Check,
  CookingPot,
  Copy,
  LoaderCircle,
  LockKeyhole,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { Recipe } from "./types";
import { equipment } from "../shared/ingredients.mjs";

function FamilyDialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      ref.current?.close();
    };
  }, []);
  return (
    <dialog
      className={`modal ${wide ? "wide" : ""}`}
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <header className="modal-header">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="关闭" onClick={onClose}>
          <X size={21} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
async function photoData(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 20_000_000
  )
    throw new Error("请选择20MB以内的JPG、PNG或WebP照片");
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("当前浏览器无法处理照片");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let data = canvas.toDataURL("image/jpeg", 0.82);
  if (data.length > 2_600_000) data = canvas.toDataURL("image/jpeg", 0.6);
  if (data.length > 2_600_000)
    throw new Error("照片仍然太大，请换一张较小的照片");
  return data;
}
export function FamilyRecipeEditor({
  recipe,
  canEdit,
  configured,
  onClose,
  onSaved,
  onAuth,
}: {
  recipe?: Recipe;
  canEdit: boolean;
  configured: boolean;
  onClose: () => void;
  onSaved: (recipe: Recipe) => void;
  onAuth: () => void;
}) {
  const [unlocked, setUnlocked] = useState(canEdit),
    [code, setCode] = useState(""),
    [title, setTitle] = useState(recipe?.title || ""),
    [author, setAuthor] = useState(recipe?.author || ""),
    [ingredients, setIngredients] = useState(
      recipe?.ingredientLines?.join("\n") || "",
    ),
    [steps, setSteps] = useState(
      recipe?.steps?.map((x) => x.text).join("\n") || "",
    ),
    [minutes, setMinutes] = useState(recipe?.minutes || 30),
    [servings, setServings] = useState(recipe?.baseServings || 2),
    [tools, setTools] = useState<string[]>(recipe?.equipment || ["wok"]),
    [prep, setPrep] = useState(recipe?.prep || false),
    [note, setNote] = useState(recipe?.note || ""),
    [photo, setPhoto] = useState<string | null>(null),
    [removePhoto, setRemovePhoto] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [imageBusy, setImageBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  async function unlock() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/family/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setUnlocked(true);
      setCode("");
      onAuth();
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    const lines = ingredients
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      stepLines = steps
        .split("\n")
        .map((x) => x.trim().replace(/^\d+[.、)）\s]+/, ""))
        .filter(Boolean);
    if (!title.trim() || !lines.length || !stepLines.length) {
      setError("请填写菜名、食材和做法");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await fetch(
        recipe ? `/api/family/recipes/${recipe.id}` : "/api/family/recipes",
        {
          method: recipe ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            author: author || "家人",
            ingredientLines: lines,
            steps: stepLines,
            minutes,
            baseServings: servings,
            equipment: tools,
            prep,
            note,
            photoData: photo,
            removePhoto,
            updatedAt: recipe?.updatedAt,
          }),
        },
      );
      const d = await r.json();
      if (r.status === 401) {
        setUnlocked(false);
        throw new Error("请重新输入家庭口令");
      }
      if (!r.ok) throw new Error(d.error || "保存失败");
      onSaved(d.recipe);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }
  const image = photo || (!removePhoto ? recipe?.image : null);
  return (
    <FamilyDialog
      title={recipe ? "编辑家常菜" : "添加一道家常菜"}
      onClose={onClose}
      wide={unlocked}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          unlocked ? void save() : void unlock();
        }}
      >
        {!unlocked ? (
          <div className="family-unlock">
            <span className="unlock-icon">
              <LockKeyhole size={30} />
            </span>
            <h3>全家共用一个口令</h3>
            <p>
              {configured
                ? "输入家人给你的口令，就能添加和修改菜谱。"
                : "网站还没有配置口令，请联系管理员。"}
            </p>
            <label>
              家庭口令
              <input
                autoComplete="current-password"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                aria-label="家庭口令"
                required
                minLength={8}
                maxLength={200}
                disabled={!configured}
              />
            </label>
          </div>
        ) : (
          <div className="family-form">
            <div className="family-form-fields">
              <div className="form-two">
                <label>
                  菜名<span className="required">*</span>
                  <input
                    aria-label="菜名"
                    placeholder="例如：妈妈的土豆炖牛肉"
                    value={title}
                    maxLength={70}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>
                <label>
                  谁的拿手菜
                  <input
                    aria-label="菜谱作者"
                    placeholder="例如：妈妈、爸爸"
                    value={author}
                    maxLength={30}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </label>
              </div>
              <div className="form-two">
                <label>
                  大约用时（分钟）
                  <input
                    aria-label="菜谱用时"
                    type="number"
                    min={1}
                    max={1440}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    required
                  />
                </label>
                <label>
                  几个人吃
                  <input
                    aria-label="菜谱份数"
                    type="number"
                    min={1}
                    max={20}
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    required
                  />
                </label>
              </div>
              <fieldset className="family-tools">
                <legend>用什么锅</legend>
                {equipment.map((item) => (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      checked={tools.includes(item.id)}
                      onChange={(e) =>
                        setTools(
                          e.target.checked
                            ? [...tools, item.id]
                            : tools.filter((x) => x !== item.id),
                        )
                      }
                    />
                    {item.name}
                  </label>
                ))}
              </fieldset>
              <label>
                食材和用量<span className="required">*</span>
                <textarea
                  aria-label="菜谱食材"
                  rows={5}
                  placeholder={"牛肉 300g\n土豆 2个\n洋葱 半个\n生抽 1勺"}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  maxLength={3600}
                  required
                />
              </label>
              <label>
                做法<span className="required">*</span>
                <textarea
                  aria-label="菜谱步骤"
                  rows={6}
                  placeholder={
                    "食材洗净、切好。\n牛肉焯水后下锅。\n加入土豆，小火炖至软烂。"
                  }
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  maxLength={15000}
                  required
                />
              </label>
              <label>
                小窍门
                <textarea
                  aria-label="菜谱小窍门"
                  rows={2}
                  placeholder="火候、口味、妈妈的小经验……"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={600}
                />
              </label>
              <label className="family-prep">
                <input
                  type="checkbox"
                  checked={prep}
                  onChange={(e) => setPrep(e.target.checked)}
                />
                这道菜适合做带饭餐
              </label>
            </div>
            <aside className="family-form-photo">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="上传菜谱照片"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImageBusy(true);
                  setError("");
                  try {
                    setPhoto(await photoData(file));
                    setRemovePhoto(false);
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "照片无法读取，请选择JPG照片",
                    );
                  } finally {
                    setImageBusy(false);
                    e.target.value = "";
                  }
                }}
                className="file-input"
              />
              <button
                type="button"
                className={`photo-upload ${image ? "has-photo" : ""}`}
                onClick={() => fileRef.current?.click()}
                disabled={imageBusy}
              >
                {image ? (
                  <img src={image} alt="菜谱成品照片预览" />
                ) : (
                  <>
                    <Camera size={35} strokeWidth={1.4} />
                    <span>拍成品 / 选照片</span>
                    <small>照片可以稍后再加</small>
                  </>
                )}
                {imageBusy && (
                  <span className="image-busy">
                    <LoaderCircle className="spin" size={22} />
                  </span>
                )}
              </button>
              {image && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setPhoto(null);
                    setRemovePhoto(true);
                  }}
                >
                  <X size={14} />
                  移除照片
                </button>
              )}
              <p className="family-photo-note">写下家里的味道。</p>
            </aside>
          </div>
        )}
        {error && (
          <p className="family-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            取消
          </button>
          <button
            className="primary-button"
            type="submit"
            disabled={busy || imageBusy || (!unlocked && !configured)}
          >
            {busy ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Check size={17} />
            )}{" "}
            {unlocked ? "保存到全家菜谱" : "进入"}
          </button>
        </div>
      </form>
    </FamilyDialog>
  );
}
export function FamilyRecipeDetail({
  recipe,
  canEdit,
  onClose,
  onEdit,
  onRemove,
  onToast,
}: {
  recipe: Recipe;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRemove: () => Promise<void>;
  onToast: (text: string) => void;
}) {
  const [checked, setChecked] = useState<number[]>([]),
    [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false);
  async function copy() {
    const url = new URL(window.location.href);
    url.searchParams.set("recipe", recipe.id);
    url.hash = "";
    try {
      await navigator.clipboard.writeText(`${recipe.title}\n${url.href}`);
      onToast("分享链接已复制");
    } catch {
      onToast("复制失败，请从浏览器地址栏分享");
    }
  }
  return (
    <FamilyDialog title={recipe.title} onClose={onClose} wide>
      <div className="recipe-detail">
        <aside className="detail-side">
          <div className="detail-photo">
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.title} />
            ) : (
              <div className="photo-fallback">
                <CookingPot size={40} />
                <span>还没有成品照片</span>
              </div>
            )}
          </div>
          <div className="source-caption family-byline">
            {recipe.author || "家人"}的拿手菜 · {recipe.baseServings}人份 · 约
            {recipe.minutes}分钟
          </div>
          <div className="detail-actions">
            <button className="secondary-button" onClick={copy}>
              <Copy size={16} />
              复制分享链接
            </button>
            <button
              className="icon-button"
              aria-label="编辑这道家常菜"
              title="编辑菜谱"
              onClick={onEdit}
            >
              <Pencil size={18} />
            </button>
          </div>
          {recipe.note && <p className="prep-note">{recipe.note}</p>}
          {canEdit && (
            <div className="family-delete">
              {confirm ? (
                <>
                  <p>移出全家菜谱？移除后可以撤销。</p>
                  <button
                    className="danger-button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await onRemove();
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {busy ? "正在移除" : "确认移除"}
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setConfirm(false)}
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  className="text-button"
                  onClick={() => setConfirm(true)}
                >
                  <Trash2 size={14} />
                  移除这道菜
                </button>
              )}
            </div>
          )}
        </aside>
        <div className="detail-main">
          <h3>食材 · {recipe.baseServings}人份</h3>
          <ul className="source-ingredients">
            {recipe.ingredientLines?.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          <div className="steps-heading">
            <h3>开始做菜</h3>
            <span>
              {checked.length}/{recipe.steps?.length}步
            </span>
          </div>
          <ol className="cooking-steps">
            {recipe.steps?.map((step) => (
              <li
                key={step.id}
                className={checked.includes(step.id) ? "done" : ""}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={checked.includes(step.id)}
                    onChange={(e) =>
                      setChecked(
                        e.target.checked
                          ? [...checked, step.id]
                          : checked.filter((x) => x !== step.id),
                      )
                    }
                  />
                  <span className="step-number">
                    {checked.includes(step.id) ? <Check size={16} /> : step.id}
                  </span>
                  <span>{step.text}</span>
                </label>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </FamilyDialog>
  );
}
