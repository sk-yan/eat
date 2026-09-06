import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  ChefHat,
  ChevronDown,
  Clock3,
  CookingPot,
  Copy,
  Egg,
  ExternalLink,
  Leaf,
  LoaderCircle,
  Minus,
  Package,
  Pencil,
  Plus,
  Refrigerator,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Utensils,
  Users,
  Wheat,
  X,
} from "lucide-react";
import {
  ingredients as initialIngredients,
  equipment,
  identifyIngredients,
} from "../shared/ingredients.mjs";
import { filterRecipes, matchRecipe } from "../shared/matching.mjs";
import type { Category, Ingredient, Recipe, SearchResponse } from "./types";
import { FamilyRecipeEditor, FamilyRecipeDetail } from "./FamilyRecipes";
import WeekPlan from "./WeekPlan";

const STORE = "afterwork-kitchen-v1";
const groupNames: Record<Category, string> = {
  protein: "肉类与鸡蛋",
  vegetable: "新鲜蔬菜",
  staple: "主食",
  other: "奶与水果",
  seasoning: "基础用油",
};
const defaultSelected = ["breast", "broccoli", "mushroom"];
function loadSaved() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE) || "{}");
    const savedPantry: Ingredient[] | null =
      Array.isArray(data.pantry) &&
      data.pantry.length &&
      data.pantry.every(
        (x: Ingredient) =>
          typeof x.id === "string" &&
          typeof x.name === "string" &&
          x.category in groupNames &&
          typeof x.quantity === "number" &&
          Number.isFinite(x.quantity) &&
          x.quantity >= 0 &&
          typeof x.unit === "string" &&
          Array.isArray(x.aliases),
      )
        ? data.pantry
        : null;
    const defaults = initialIngredients as Ingredient[];
    const pantry: Ingredient[] = savedPantry
      ? [
          ...savedPantry,
          ...defaults.filter(
            (item) => !savedPantry.some((savedItem) => savedItem.id === item.id),
          ),
        ]
      : defaults;
    return {
      pantry,
      selected: Array.isArray(data.selected)
        ? data.selected
            .filter(
              (id: unknown) =>
                typeof id === "string" && pantry.some((x) => x.id === id),
            )
            .slice(0, 6)
        : defaultSelected,
      favorites: Array.isArray(data.favorites)
        ? data.favorites.filter(
            (r: Recipe) =>
              typeof r.id === "string" &&
              typeof r.title === "string" &&
              Array.isArray(r.ingredientIds) &&
              typeof r.url === "string" &&
              (/^https:\/\/(m|www)\.xiachufang\.com\/recipe\/\d+\//.test(
                r.url,
              ) ||
                (r.origin === "family" && /^family-[a-f0-9-]{36}$/.test(r.id))),
          )
        : [],
    };
  } catch {
    return {
      pantry: initialIngredients as Ingredient[],
      selected: defaultSelected,
      favorites: [] as Recipe[],
    };
  }
}
function quantityText(item: Ingredient) {
  if (item.unit === "g" && item.quantity >= 1000)
    return `${Number((item.quantity / 1000).toFixed(2))} kg`;
  if (item.unit === "ml" && item.quantity >= 1000)
    return `${Number((item.quantity / 1000).toFixed(2))} L`;
  return `${item.quantity} ${item.unit}`;
}
function IconButton({
  label,
  onClick,
  children,
  active,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`icon-button ${active ? "active" : ""} ${className}`}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
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
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <header className="modal-header">
        <h2>{title}</h2>
        <IconButton label="关闭" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </header>
      {children}
    </dialog>
  );
}
function DishPhoto({ src, title }: { src?: string | null; title: string }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img
      src={src}
      alt={title}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="photo-fallback">
      <CookingPot size={38} strokeWidth={1.2} />
      <span>暂无成品图</span>
    </div>
  );
}

export default function App() {
  const saved = useMemo(loadSaved, []);
  const [pantry, setPantry] = useState<Ingredient[]>(saved.pantry);
  const [selected, setSelected] = useState<string[]>(saved.selected);
  const [favorites, setFavorites] = useState<Recipe[]>(saved.favorites);
  const [page, setPage] = useState<"find" | "favorites" | "family" | "week">(
    () =>
      new URLSearchParams(window.location.search).get("week") === "1"
        ? "week"
        : "find",
  );
  const [view, setView] = useState<"curated" | "online">("curated");
  const [catalog, setCatalog] = useState<Recipe[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [familyRecipes, setFamilyRecipes] = useState<Recipe[]>([]);
  const [familyLoading, setFamilyLoading] = useState(true);
  const [familyError, setFamilyError] = useState("");
  const [canEditFamily, setCanEditFamily] = useState(false);
  const [familyConfigured, setFamilyConfigured] = useState(true);
  const [familyEditor, setFamilyEditor] = useState<Recipe | "new" | null>(null);
  const [undoRecipe, setUndoRecipe] = useState<Recipe | null>(null);
  const deepLinkHandled = useRef(false);
  const [boot, setBoot] = useState(0);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [detail, setDetail] = useState<Recipe | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [mobilePicker, setMobilePicker] = useState(false);
  const [toast, setToast] = useState("");
  const [strict, setStrict] = useState(false);
  const [tool, setTool] = useState("");
  const [time, setTime] = useState(0);
  const [prep, setPrep] = useState(false);
  const searchController = useRef<AbortController | null>(null);
  const selectionKey = selected.slice().sort().join("|");

  useEffect(() => {
    try {
      localStorage.setItem(
        STORE,
        JSON.stringify({ pantry, selected, favorites }),
      );
    } catch {
      /* Private mode may disable persistent storage. */
    }
  }, [pantry, selected, favorites]);
  useEffect(() => {
    const controller = new AbortController();
    setCatalogError("");
    setCatalogLoading(true);
    fetch("/api/catalog", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("备餐菜谱加载失败");
        const data = await response.json();
        setCatalog(data.recipes);
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setCatalogError("备餐菜谱暂时无法加载");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogLoading(false);
      });
    return () => controller.abort();
  }, [boot]);
  useEffect(() => {
    if (toast) {
      const timer = window.setTimeout(() => setToast(""), 2800);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    searchController.current?.abort();
    setLoading(false);
    setResult(null);
    setSearchError("");
  }, [selectionKey]);
  useEffect(() => () => searchController.current?.abort(), []);

  async function refreshFamily() {
    try {
      const response = await fetch("/api/family");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "全家菜谱暂时无法读取");
      setFamilyRecipes(data.recipes);
      setCanEditFamily(data.canEdit);
      setFamilyConfigured(data.configured);
      setFamilyError("");
      setFavorites((previous) =>
        previous.flatMap((recipe) =>
          recipe.origin !== "family"
            ? [recipe]
            : data.recipes.filter((item: Recipe) => item.id === recipe.id),
        ),
      );
      const requested = new URLSearchParams(window.location.search).get(
        "recipe",
      );
      const target = data.recipes.find(
        (recipe: Recipe) => recipe.id === requested,
      );
      if (target && !deepLinkHandled.current) {
        setPage("family");
        setDetail(target);
        deepLinkHandled.current = true;
      }
    } catch (error) {
      setFamilyError(
        error instanceof Error ? error.message : "全家菜谱暂时无法读取",
      );
    } finally {
      setFamilyLoading(false);
    }
  }
  useEffect(() => {
    void refreshFamily();
    const refresh = () => {
      if (document.visibilityState === "visible") void refreshFamily();
    };
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 30000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const familyWithIngredients = useMemo(
    () =>
      familyRecipes.map((recipe) => ({
        ...recipe,
        ingredientIds: identifyIngredients(
          recipe.ingredientLines?.join(" ") || "",
          pantry,
        ),
      })),
    [familyRecipes, pantry],
  );
  const allCatalog = useMemo(
    () => [...catalog, ...familyWithIngredients],
    [catalog, familyWithIngredients],
  );

  const chosen = pantry.filter((item) => selected.includes(item.id));
  const matched = useMemo(
    () =>
      filterRecipes(allCatalog, selected, pantry, {
        strict,
        equipment: tool,
        maxTime: time,
        prep,
      }),
    [allCatalog, selected, pantry, strict, tool, time, prep],
  );
  const fullMatchCount = matched.filter(
    (item) => item.missing.length === 0,
  ).length;
  const selectedNames = chosen.map((item) => item.searchName || item.name);
  const directSearch = `https://m.xiachufang.com/search/?keyword=${encodeURIComponent(selectedNames.join(" "))}`;

  function selectIngredient(id: string) {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 6) setSelected([...selected, id]);
    else setToast("一次最多选择6种食材");
    setPage("find");
  }
  function selectCombo(ids: string[]) {
    setSelected(
      ids.filter((id) => pantry.some((x) => x.id === id && x.quantity > 0)),
    );
    setPage("find");
    setView("curated");
    setStrict(false);
    setTool("");
    setTime(0);
    setPrep(false);
  }
  async function onlineSearch() {
    if (!chosen.length) {
      setToast("尚未选择食材");
      return;
    }
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setView("online");
    setPage("find");
    setLoading(true);
    setSearchError("");
    setMobilePicker(false);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: selectedNames }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "搜索失败");
      if (!controller.signal.aborted) setResult(data);
    } catch (error) {
      if (!controller.signal.aborted)
        setSearchError(
          error instanceof Error ? error.message : "暂时无法连接菜谱来源",
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  function toggleFavorite(recipe: Recipe) {
    const exists = favorites.some((r) => r.id === recipe.id);
    setFavorites(
      exists
        ? favorites.filter((r) => r.id !== recipe.id)
        : [...favorites, recipe],
    );
    setToast(exists ? "已取消收藏" : "已加入收藏");
  }
  const picker = (
    <IngredientPicker
      pantry={pantry}
      selected={selected}
      onSelect={selectIngredient}
      onEdit={() => {
        setMobilePicker(false);
        setInventoryOpen(true);
      }}
      onClear={() => setSelected([])}
    />
  );
  const displayed =
    page === "family"
      ? familyWithIngredients
      : page === "favorites"
        ? favorites
        : view === "online"
          ? result?.recipes || []
          : matched.map((x) => x.recipe);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setPage("find");
          }}
          aria-label="下班厨房首页"
        >
          <span className="brand-mark">
            <ChefHat size={24} strokeWidth={1.7} />
          </span>
          <span>
            下班厨房<span className="brand-sub">AFTERWORK KITCHEN</span>
          </span>
        </a>
        <nav className="main-nav" aria-label="主要导航">
          <button
            className={page === "week" ? "nav-active" : ""}
            onClick={() => setPage("week")}
          >
            <CalendarDays size={16} />
            一周食谱
          </button>
          <button
            className={page === "find" ? "nav-active" : ""}
            onClick={() => setPage("find")}
          >
            <Utensils size={16} />
            找菜谱
          </button>
          <button
            className={page === "favorites" ? "nav-active" : ""}
            onClick={() => setPage("favorites")}
          >
            <Bookmark size={16} />
            我的收藏
            {favorites.length > 0 && (
              <span className="nav-count">{favorites.length}</span>
            )}
          </button>
          <button
            className={page === "family" ? "nav-active" : ""}
            onClick={() => {
              setPage("family");
              void refreshFamily();
            }}
          >
            <Users size={16} />
            全家菜谱
          </button>
        </nav>
        <button
          className="inventory-trigger"
          aria-label="我的库存"
          title="我的库存"
          onClick={() => setInventoryOpen(true)}
        >
          <Refrigerator size={17} />
          <span>我的库存</span>
          <span className="inventory-count">
            {pantry.filter((x) => x.quantity > 0).length}
          </span>
        </button>
        <button
          className="add-recipe-top primary-button"
          aria-label="添加菜谱"
          title="添加菜谱"
          onClick={() => setFamilyEditor("new")}
        >
          <Plus size={17} />
          <span>添加菜谱</span>
        </button>
      </header>

      {page === "week" ? (
        <WeekPlan />
      ) : (
        <div className="workspace">
          <aside className="sidebar">
            {picker}
            <div className="equipment-section">
              <div className="section-label">
                <CookingPot size={15} />
                我的厨具
              </div>
              <div className="equipment-tags">
                {equipment.map((item) => (
                  <span key={item.id}>{item.name}</span>
                ))}
              </div>
            </div>
            <div className="sidebar-footer">
              <span className="status-dot" />
              我的厨房 · 本地保存
            </div>
          </aside>
          <main className="main-content">
            <div className="page-heading">
              <div>
                <p className="eyebrow">
                  {page === "family"
                    ? "FAMILY COOKBOOK"
                    : page === "favorites"
                      ? "MY COLLECTION"
                      : "YOUR EVERYDAY TABLE"}
                </p>
                <h1>
                  {page === "family"
                    ? "家里的拿手菜"
                    : page === "favorites"
                      ? "想再做一次的菜"
                      : "今晚做什么"}
                </h1>
              </div>
              <span className="page-heading-icon">
                <Leaf size={27} strokeWidth={1.35} />
              </span>
            </div>
            {page === "find" && (
              <>
                <section className="selection-bar" aria-label="已选食材">
                  <div className="selection-top">
                    <span className="small-label">今天用这些</span>
                    <button
                      className="mobile-choose text-button"
                      onClick={() => setMobilePicker(true)}
                    >
                      <SlidersHorizontal size={15} />
                      选食材
                    </button>
                  </div>
                  <div className="selection-content">
                    <div className="selected-items">
                      {chosen.length ? (
                        chosen.map((item) => (
                          <span
                            className={`selected-item ${item.category}`}
                            key={item.id}
                          >
                            {item.name}
                            <button
                              aria-label={`移除${item.name}`}
                              onClick={() => selectIngredient(item.id)}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="selection-empty">尚未选择食材</span>
                      )}
                    </div>
                    <button
                      className="find-button"
                      onClick={onlineSearch}
                      disabled={!chosen.length || loading}
                    >
                      {loading ? (
                        <LoaderCircle size={18} className="spin" />
                      ) : (
                        <Search size={18} />
                      )}
                      <span>{loading ? "正在查找" : "找菜谱"}</span>
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </section>
                <div className="quick-combos">
                  <span>换个搭配</span>
                  <button
                    onClick={() =>
                      selectCombo(["shrimp", "asparagus", "mushroom"])
                    }
                  >
                    虾仁 + 芦笋
                    <ArrowUpRight size={13} />
                  </button>
                  <button
                    onClick={() =>
                      selectCombo(["rib", "potato", "onion", "carrot"])
                    }
                  >
                    牛肋条 + 土豆
                    <ArrowUpRight size={13} />
                  </button>
                  <button
                    onClick={() => selectCombo(["leg", "mushroom", "onion"])}
                  >
                    鸡腿 + 口蘑
                    <ArrowUpRight size={13} />
                  </button>
                </div>
                <div className="result-nav">
                  <div
                    className="result-tabs"
                    role="tablist"
                    aria-label="菜谱类型"
                  >
                    <button
                      role="tab"
                      aria-selected={view === "curated"}
                      className={view === "curated" ? "selected" : ""}
                      onClick={() => setView("curated")}
                    >
                      备餐做法<span>{matched.length}</span>
                    </button>
                    <button
                      role="tab"
                      aria-selected={view === "online"}
                      className={view === "online" ? "selected" : ""}
                      onClick={() => setView("online")}
                    >
                      网上菜谱{result && <span>{result.recipes.length}</span>}
                    </button>
                  </div>
                  <span className="result-meta">
                    {view === "curated"
                      ? `${fullMatchCount}道无须增加主料`
                      : result
                        ? `下厨房 · ${new Date(result.fetchedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}${result.cached ? " 缓存结果" : " 检索"}`
                        : "来源：下厨房"}
                  </span>
                </div>
                {view === "curated" && (
                  <div className="filters">
                    <label className="filter-select">
                      <CookingPot size={15} />
                      <select
                        aria-label="筛选厨具"
                        value={tool}
                        onChange={(event) => setTool(event.target.value)}
                      >
                        <option value="">全部厨具</option>
                        {equipment.map((e) => (
                          <option value={e.id} key={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} />
                    </label>
                    <label className="filter-select">
                      <Clock3 size={15} />
                      <select
                        aria-label="筛选用时"
                        value={time}
                        onChange={(event) =>
                          setTime(Number(event.target.value))
                        }
                      >
                        <option value={0}>不限用时</option>
                        <option value={15}>15分钟内</option>
                        <option value={30}>30分钟内</option>
                        <option value={60}>60分钟内</option>
                      </select>
                      <ChevronDown size={13} />
                    </label>
                    <label className="filter-check">
                      <input
                        type="checkbox"
                        checked={prep}
                        onChange={(event) => setPrep(event.target.checked)}
                      />
                      适合带饭
                    </label>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        role="switch"
                        checked={strict}
                        onChange={(event) => setStrict(event.target.checked)}
                      />
                      <span className="toggle-track" />
                      仅用已选食材
                    </label>
                  </div>
                )}
              </>
            )}
            {page === "favorites" && (
              <div className="favorites-heading">
                <span>{favorites.length}道菜谱</span>
                <button className="text-button" onClick={() => setPage("find")}>
                  <ArrowLeft size={15} />
                  继续找菜谱
                </button>
              </div>
            )}
            {page === "family" && (
              <div className="family-heading">
                <span>{familyRecipes.length}道家常菜</span>
                <button
                  className="text-button"
                  onClick={() => void refreshFamily()}
                >
                  <RotateCcw size={15} />
                  刷新
                </button>
              </div>
            )}

            {(page === "find" &&
              ((view === "online" && loading) ||
                (view === "curated" && catalogLoading))) ||
            (page === "family" && familyLoading) ? (
              <div
                className="recipe-grid skeleton-grid"
                aria-label="正在搜索菜谱"
              >
                {[1, 2, 3, 4, 5, 6].map((x) => (
                  <div className="skeleton-card" key={x}>
                    <div />
                    <span />
                    <span />
                  </div>
                ))}
              </div>
            ) : page === "find" &&
              view === "online" &&
              (searchError || !result) ? (
              <EmptyState
                icon={<Search size={32} />}
                title={searchError ? "这次没能连上原站" : "网上菜谱"}
                text={
                  searchError ||
                  (chosen.length
                    ? chosen.map((x) => x.name).join(" · ")
                    : "尚未选择食材")
                }
              >
                <button
                  className="primary-button"
                  disabled={!chosen.length}
                  onClick={onlineSearch}
                >
                  <Search size={16} />
                  {searchError ? "重新查找" : "搜索这些食材"}
                </button>
                {chosen.length > 0 && (
                  <a
                    className="secondary-button"
                    href={directSearch}
                    target="_blank"
                    rel="noreferrer"
                  >
                    到下厨房搜索
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </EmptyState>
            ) : catalogError && view === "curated" && page === "find" ? (
              <EmptyState
                icon={<CookingPot size={32} />}
                title={catalogError}
                text=""
              >
                <button
                  className="primary-button"
                  onClick={() => setBoot((x) => x + 1)}
                >
                  重新加载
                </button>
              </EmptyState>
            ) : page === "family" && familyError ? (
              <EmptyState
                icon={<Users size={32} />}
                title="全家菜谱暂时无法读取"
                text={familyError}
              >
                <button
                  className="primary-button"
                  onClick={() => void refreshFamily()}
                >
                  重试
                </button>
              </EmptyState>
            ) : displayed.length ? (
              <>
                <div className="recipe-grid">
                  {displayed.map((recipe, index) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      selected={selected}
                      pantry={pantry}
                      favorite={favorites.some((r) => r.id === recipe.id)}
                      onFavorite={() => toggleFavorite(recipe)}
                      onOpen={() => setDetail(recipe)}
                      index={index}
                    />
                  ))}
                </div>
                <div className="results-end">
                  <span />
                  {page === "family"
                    ? `${displayed.length}道家常菜 · 全家共享`
                    : page === "favorites"
                      ? "留给下一次下厨"
                      : view === "curated"
                        ? `${displayed.length}道备餐做法 · 主料按一人份整理`
                        : `${displayed.length}条原站结果 · 用料以原菜谱为准`}
                  <span />
                </div>
                {page === "find" && view === "curated" && (
                  <button className="more-online" onClick={onlineSearch}>
                    <Search size={16} />
                    再到网上找一找
                    <ArrowRight size={16} />
                  </button>
                )}
              </>
            ) : (
              <EmptyState
                icon={
                  page === "favorites" ? (
                    <Bookmark size={32} />
                  ) : (
                    <CookingPot size={32} />
                  )
                }
                title={
                  page === "family"
                    ? "家里的第一道拿手菜"
                    : page === "favorites"
                      ? "收藏夹还空着"
                      : view === "online"
                        ? "原站没有返回对应菜谱"
                        : !selected.length
                          ? "今天想用哪些食材"
                          : "暂时没有符合条件的做法"
                }
                text={
                  page === "family"
                    ? "把熟悉的味道，记在一起。"
                    : page === "favorites"
                      ? "喜欢的菜，留在这里。"
                      : selected.length
                        ? chosen.map((x) => x.name).join(" · ")
                        : "你的食材已经在厨房里。"
                }
              >
                {page === "family" ? (
                  <button
                    className="primary-button"
                    onClick={() => setFamilyEditor("new")}
                  >
                    <Plus size={17} />
                    添加家常菜
                  </button>
                ) : page === "favorites" ? (
                  <button
                    className="primary-button"
                    onClick={() => setPage("find")}
                  >
                    去找菜谱
                    <ArrowRight size={16} />
                  </button>
                ) : !selected.length ? (
                  <button
                    className="primary-button"
                    onClick={() => selectCombo(defaultSelected)}
                  >
                    鸡胸肉 + 西兰花 + 口蘑
                  </button>
                ) : (
                  <>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setStrict(false);
                        setTool("");
                        setTime(0);
                        setPrep(false);
                        setView("curated");
                      }}
                    >
                      清除筛选
                    </button>
                    <a
                      className="primary-button"
                      href={directSearch}
                      target="_blank"
                      rel="noreferrer"
                    >
                      去原站查找
                      <ArrowUpRight size={16} />
                    </a>
                  </>
                )}
              </EmptyState>
            )}
          </main>
        </div>
      )}
      {mobilePicker && (
        <Modal title="选择食材" onClose={() => setMobilePicker(false)}>
          {picker}
          <div className="modal-actions">
            <button
              className="primary-button"
              onClick={() => setMobilePicker(false)}
            >
              查看匹配做法
              <ArrowRight size={16} />
            </button>
            <button
              className="secondary-button"
              onClick={onlineSearch}
              disabled={!selected.length}
            >
              网上查找
            </button>
          </div>
        </Modal>
      )}
      {inventoryOpen && (
        <InventoryModal
          pantry={pantry}
          onClose={() => setInventoryOpen(false)}
          onSave={(items) => {
            setPantry(items);
            setSelected(
              selected.filter((id) =>
                items.some((x) => x.id === id && x.quantity > 0),
              ),
            );
            setInventoryOpen(false);
            setToast("库存已更新");
          }}
        />
      )}
      {familyEditor && (
        <FamilyRecipeEditor
          key={familyEditor === "new" ? "new" : familyEditor.id}
          recipe={familyEditor === "new" ? undefined : familyEditor}
          canEdit={canEditFamily}
          configured={familyConfigured}
          onClose={() => setFamilyEditor(null)}
          onAuth={() => setCanEditFamily(true)}
          onSaved={(recipe) => {
            setFamilyEditor(null);
            setPage("family");
            setDetail(recipe);
            setToast("已保存，全家都能看到");
            void refreshFamily();
          }}
        />
      )}
      {detail?.origin === "family" && (
        <FamilyRecipeDetail
          key={detail.id}
          recipe={detail}
          canEdit={canEditFamily}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setFamilyEditor(detail);
            setDetail(null);
          }}
          onToast={setToast}
          onRemove={async () => {
            try {
              const response = await fetch(`/api/family/recipes/${detail.id}`, {
                method: "DELETE",
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error);
              setUndoRecipe(detail);
              setDetail(null);
              void refreshFamily();
              setToast("菜谱已移除");
            } catch (error) {
              setToast(error instanceof Error ? error.message : "移除失败");
            }
          }}
        />
      )}
      {detail && detail.origin !== "family" && (
        <RecipeModal
          key={detail.id}
          recipe={detail}
          pantry={pantry}
          favorite={favorites.some((r) => r.id === detail.id)}
          onFavorite={toggleFavorite}
          onClose={() => setDetail(null)}
          onToast={setToast}
        />
      )}
      {undoRecipe && (
        <div className="undo-toast" role="status">
          <span>已移除「{undoRecipe.title}」</span>
          <button
            onClick={async () => {
              try {
                const response = await fetch(
                  `/api/family/recipes/${undoRecipe.id}/restore`,
                  { method: "POST" },
                );
                if (!response.ok) throw new Error();
                setUndoRecipe(null);
                void refreshFamily();
                setToast("菜谱已恢复");
              } catch {
                setToast("恢复失败，请重试");
              }
            }}
          >
            撤销
          </button>
          <button aria-label="关闭撤销提示" onClick={() => setUndoRecipe(null)}>
            <X size={15} />
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

function IngredientPicker({
  pantry,
  selected,
  onSelect,
  onEdit,
  onClear,
}: {
  pantry: Ingredient[];
  selected: string[];
  onSelect: (id: string) => void;
  onEdit: () => void;
  onClear: () => void;
}) {
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const categories: Category[] = ["protein", "vegetable", "staple", "other"];
  return (
    <div className="ingredient-picker">
      <header className="picker-heading">
        <div>
          <Refrigerator size={19} />
          <h2>选择食材</h2>
        </div>
        <IconButton label="编辑食材库存" onClick={onEdit}>
          <Pencil size={15} />
        </IconButton>
      </header>
      <label className="ingredient-search">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索我的食材"
          aria-label="搜索我的食材"
        />
        {query && (
          <button aria-label="清空食材搜索" onClick={() => setQuery("")}>
            <X size={14} />
          </button>
        )}
      </label>
      <div className="ingredient-tabs" role="tablist" aria-label="食材分类">
        {[
          ["all", "全部"],
          ["protein", "肉蛋"],
          ["vegetable", "蔬菜"],
          ["rest", "其他"],
        ].map(([id, name]) => (
          <button
            role="tab"
            aria-selected={group === id}
            className={group === id ? "selected" : ""}
            key={id}
            onClick={() => setGroup(id)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="ingredient-list">
        {categories.map((category) => {
          const items = pantry.filter(
            (item) =>
              item.category === category &&
              (group === "all" ||
                group === category ||
                (group === "rest" && ["staple", "other"].includes(category))) &&
              [item.name, ...item.aliases].some((name) => name.includes(query)),
          );
          if (!items.length) return null;
          return (
            <section className="ingredient-group" key={category}>
              <h3>
                {category === "protein" ? (
                  <Egg size={14} />
                ) : category === "vegetable" ? (
                  <Leaf size={14} />
                ) : (
                  <Wheat size={14} />
                )}
                {groupNames[category]}
                <span>{items.length}</span>
              </h3>
              <div className="ingredient-options">
                {items.map((item) => (
                  <label
                    className={`ingredient-option ${selected.includes(item.id) ? "checked" : ""} ${item.quantity === 0 ? "unavailable" : ""}`}
                    key={item.id}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      disabled={item.quantity === 0}
                      onChange={() => onSelect(item.id)}
                    />
                    <span className="custom-check">
                      {selected.includes(item.id) && (
                        <Check size={12} strokeWidth={3} />
                      )}
                    </span>
                    <span className="ingredient-copy">
                      <span>{item.name}</span>
                      <small>
                        {item.quantity > 0 ? quantityText(item) : "已用完"}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          );
        })}
        {!pantry.some(
          (item) =>
            item.category !== "seasoning" &&
            [item.name, ...item.aliases].some((name) => name.includes(query)),
        ) && <p className="no-ingredients">没有找到“{query}”</p>}
      </div>
      <div className="picker-summary">
        <span>
          已选 <b>{selected.length}</b> / 6
        </span>
        <button
          className="text-button"
          onClick={onClear}
          disabled={!selected.length}
        >
          <RotateCcw size={13} />
          清空
        </button>
      </div>
    </div>
  );
}
function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      <div className="empty-actions">{children}</div>
    </div>
  );
}
function RecipeCard({
  recipe,
  selected,
  pantry,
  favorite,
  onFavorite,
  onOpen,
  index,
}: {
  recipe: Recipe;
  selected: string[];
  pantry: Ingredient[];
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
  index: number;
}) {
  const match = matchRecipe(recipe, selected, pantry);
  const names = recipe.ingredientIds
    .map((id) => pantry.find((x) => x.id === id)?.name)
    .filter(Boolean);
  return (
    <article
      className="recipe-card"
      style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
    >
      <div className="recipe-photo">
        <button
          className="photo-open"
          onClick={onOpen}
          aria-label={`查看${recipe.title}`}
        >
          <DishPhoto src={recipe.image} title={recipe.title} />
        </button>
        <button
          className={`save-photo ${favorite ? "saved" : ""}`}
          onClick={onFavorite}
          aria-label={`${favorite ? "取消收藏" : "收藏"}${recipe.title}`}
          title={favorite ? "取消收藏" : "收藏"}
          aria-pressed={favorite}
        >
          <Bookmark size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
        <span className="photo-badge">
          {recipe.origin === "family" ? (
            "家人分享"
          ) : recipe.origin === "curated" ? (
            <>
              <Check size={12} />
              备餐改写
            </>
          ) : (
            "下厨房原作"
          )}
        </span>
      </div>
      <div className="recipe-card-body">
        <div className="card-match">
          {recipe.origin === "family" ? (
            <span>{recipe.author || "家人"}的拿手菜</span>
          ) : recipe.origin === "curated" ? (
            match.missing.length === 0 ? (
              <>
                <span className="match-dot" />
                已选主料齐全
              </>
            ) : (
              <span className="missing-match">
                另需
                {match.missing
                  .map((id) => pantry.find((x) => x.id === id)?.name)
                  .filter(Boolean)
                  .join("、")}
              </span>
            )
          ) : (
            <span>标题匹配{match.matches.length}种食材</span>
          )}
        </div>
        <button className="recipe-title" onClick={onOpen}>
          {recipe.title}
        </button>
        <p className="recipe-ingredients">
          {names.join(" · ") || "原站用料待核对"}
        </p>
        <div className="card-metadata">
          {recipe.origin !== "online" ? (
            <>
              <span>
                <Clock3 size={14} />约{recipe.minutes}分钟
              </span>
              <span>
                <CookingPot size={14} />
                {recipe.equipment
                  ?.map((id) => equipment.find((x) => x.id === id)?.name)
                  .join(" / ") || "冷食"}
              </span>
            </>
          ) : (
            <>
              <span>下厨房</span>
              {recipe.rating && <span>原站评分 {recipe.rating}</span>}
            </>
          )}
        </div>
        <div className="card-footer">
          <span>
            {recipe.origin !== "online" ? (
              recipe.prep ? (
                <>
                  <Package size={13} />
                  可做带饭餐
                </>
              ) : (
                "现做更好吃"
              )
            ) : (
              "查看食材与来源"
            )}
          </span>
          <button onClick={onOpen} aria-label={`打开${recipe.title}做法`}>
            看做法
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
function InventoryModal({
  pantry,
  onClose,
  onSave,
}: {
  pantry: Ingredient[];
  onClose: () => void;
  onSave: (items: Ingredient[]) => void;
}) {
  const [draft, setDraft] = useState(pantry.map((item) => ({ ...item })));
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("vegetable");
  const [error, setError] = useState("");
  function add() {
    const value = name.trim();
    if (!/^[\p{L}\p{N}· ()（）-]{1,20}$/u.test(value)) {
      setError("请输入1至20字的食材名称");
      return;
    }
    if (draft.some((item) => item.name === value)) {
      setError("这项食材已经在库存中");
      return;
    }
    setDraft([
      ...draft,
      {
        id: `custom-${Date.now()}`,
        name: value,
        category,
        quantity: 500,
        unit: "g",
        aliases: [],
      },
    ]);
    setName("");
    setError("");
  }
  return (
    <Modal title="我的食材库存" onClose={onClose}>
      <div className="inventory-body">
        <div className="inventory-add">
          <input
            aria-label="新食材名称"
            placeholder="添加食材，如番茄"
            value={name}
            maxLength={20}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                add();
              }
            }}
          />
          <select
            aria-label="新食材分类"
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
          >
            <option value="vegetable">蔬菜</option>
            <option value="protein">肉蛋</option>
            <option value="staple">主食</option>
            <option value="other">其他</option>
          </select>
          <IconButton label="添加食材" onClick={add}>
            <Plus size={19} />
          </IconButton>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="inventory-list">
          {draft.map((item) => (
            <div className="inventory-row" key={item.id}>
              <span className="inventory-name">
                {item.name}
                {item.id.startsWith("custom-") && (
                  <IconButton
                    label={`删除${item.name}`}
                    onClick={() =>
                      setDraft(draft.filter((x) => x.id !== item.id))
                    }
                  >
                    <X size={13} />
                  </IconButton>
                )}
              </span>
              <span className="quantity-input">
                <input
                  aria-label={`${item.name}库存数量`}
                  type="number"
                  min={0}
                  max={100000}
                  step={item.unit === "份" || item.unit === "个" ? 1 : 10}
                  value={item.quantity}
                  onChange={(event) =>
                    setDraft(
                      draft.map((x) =>
                        x.id === item.id
                          ? {
                              ...x,
                              quantity: Math.max(
                                0,
                                Math.min(
                                  100000,
                                  Number(event.target.value) || 0,
                                ),
                              ),
                            }
                          : x,
                      ),
                    )
                  }
                />
                <span>{item.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="modal-actions">
        <button className="secondary-button" onClick={onClose}>
          取消
        </button>
        <button className="primary-button" onClick={() => onSave(draft)}>
          <Check size={16} />
          保存库存
        </button>
      </div>
    </Modal>
  );
}
function RecipeModal({
  recipe,
  pantry,
  favorite,
  onFavorite,
  onClose,
  onToast,
}: {
  recipe: Recipe;
  pantry: Ingredient[];
  favorite: boolean;
  onFavorite: (recipe: Recipe) => void;
  onClose: () => void;
  onToast: (text: string) => void;
}) {
  const [servings, setServings] = useState(1);
  const [checked, setChecked] = useState<number[]>([]);
  const [remote, setRemote] = useState<Partial<Recipe>>({});
  const [loading, setLoading] = useState(recipe.origin === "online");
  const [error, setError] = useState("");
  useEffect(() => {
    if (recipe.origin !== "online") return;
    const controller = new AbortController();
    fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: recipe.url }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setRemote(result);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(e.message || "原站用料暂不可读取");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [recipe.id, recipe.origin, recipe.url]);
  const display = { ...recipe, ...remote };
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${display.title}\n${display.url}`);
      onToast("菜谱链接已复制");
    } catch {
      onToast("复制失败，请使用原站链接");
    }
  }
  return (
    <Modal title={display.title} onClose={onClose} wide>
      <div className="recipe-detail">
        <aside className="detail-side">
          <div className="detail-photo">
            <DishPhoto src={display.image} title={display.title} />
          </div>
          <div className="source-caption">
            原作配图 · {display.source}
            {display.author ? ` / ${display.author}` : ""}
          </div>
          <div className="detail-actions">
            <button
              className={`secondary-button ${favorite ? "favorited" : ""}`}
              onClick={() => onFavorite(display)}
            >
              <Bookmark size={16} fill={favorite ? "currentColor" : "none"} />
              {favorite ? "已收藏" : "收藏菜谱"}
            </button>
            <IconButton label="复制菜谱链接" onClick={copy}>
              <Copy size={17} />
            </IconButton>
          </div>
          <a
            className="source-link"
            href={display.url}
            target="_blank"
            rel="noreferrer"
          >
            查看原站图文
            <ExternalLink size={15} />
          </a>
          {recipe.origin === "curated" && (
            <>
              <div className="detail-facts">
                <span>
                  <Clock3 size={16} />约{recipe.minutes}分钟
                </span>
                <span>
                  <CookingPot size={16} />
                  {recipe.equipment
                    ?.map((id) => equipment.find((x) => x.id === id)?.name)
                    .join(" / ") || "无需加热厨具"}
                </span>
              </div>
              <p className="prep-note">{recipe.note}</p>
              <p className="adaptation-note">
                单人备餐改写。配料和步骤经过调整，原作见来源链接。
              </p>
            </>
          )}
        </aside>
        <div className="detail-main">
          {recipe.origin === "curated" ? (
            <>
              <div className="ingredients-heading">
                <h3>食材用量</h3>
                <div className="stepper">
                  <IconButton
                    label="减少份数"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                  >
                    <Minus size={15} />
                  </IconButton>
                  <span>{servings}人份</span>
                  <IconButton
                    label="增加份数"
                    onClick={() => setServings(Math.min(6, servings + 1))}
                  >
                    <Plus size={15} />
                  </IconButton>
                </div>
              </div>
              <div className="detail-ingredients">
                {recipe.ingredients?.map((item) => (
                  <div key={item.id}>
                    <span>
                      {pantry.find((x) => x.id === item.id)?.name || item.id}
                    </span>
                    <strong>
                      {item.amount * servings}
                      {item.unit}
                    </strong>
                  </div>
                ))}
              </div>
              {!!recipe.seasonings?.length && (
                <div className="seasonings">
                  <span>调味料 · 每份</span>
                  <p>{recipe.seasonings.join("　")}</p>
                </div>
              )}
              <div className="steps-heading">
                <h3>开始做菜</h3>
                <span>
                  {checked.length}/{recipe.steps?.length} 步
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
                        onChange={(event) =>
                          setChecked(
                            event.target.checked
                              ? [...checked, step.id]
                              : checked.filter((id) => id !== step.id),
                          )
                        }
                      />
                      <span className="step-number">
                        {checked.includes(step.id) ? (
                          <Check size={16} />
                        ) : (
                          String(step.id).padStart(2, "0")
                        )}
                      </span>
                      <span>{step.text}</span>
                    </label>
                  </li>
                ))}
              </ol>
              {checked.length === recipe.steps?.length && (
                <p className="steps-complete">
                  <Check size={16} />
                  本次步骤已勾选完成
                </p>
              )}
            </>
          ) : (
            <>
              <span className="detail-kicker">下厨房原作</span>
              <h3>原站食材清单</h3>
              {loading ? (
                <div className="detail-loading">
                  <LoaderCircle size={20} className="spin" />
                  正在读取用料
                </div>
              ) : error ? (
                <p className="source-error">{error}</p>
              ) : (
                <ul className="source-ingredients">
                  {display.ingredientLines?.map((line, i) => (
                    <li key={`${line}-${i}`}>{line}</li>
                  ))}
                </ul>
              )}
              <a
                className="primary-button source-steps"
                href={display.url}
                target="_blank"
                rel="noreferrer"
              >
                查看原作者完整步骤
                <ArrowUpRight size={17} />
              </a>
              <p className="source-reading-note">
                原站用料未按你的份数、厨具或饮食偏好调整。
              </p>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
