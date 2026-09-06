import React from "react";
import { createRoot } from "react-dom/client";
import { ChefHat } from "lucide-react";
import WeekPlan from "./WeekPlan";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="weekly-standalone">
      <header className="week-site-header">
        <a href={import.meta.env.BASE_URL} aria-label="下班厨房周食谱首页">
          <span>
            <ChefHat size={23} />
          </span>
          <strong>下班厨房</strong>
        </a>
        <span>我们的周食谱</span>
      </header>
      <WeekPlan standalone />
      <footer className="week-site-footer">
        低碳高蛋白修订版 · 菜单版本 2026.09.06
      </footer>
    </div>
  </React.StrictMode>,
);
