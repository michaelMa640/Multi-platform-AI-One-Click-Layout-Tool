import type { AppView, NavItem } from "../../types";
import { useWorkspace } from "../../state/WorkspaceContext";

const navItems: NavItem[] = [
  { key: "workspace", label: "项目工作台", hint: "导入、重组、预览" },
  { key: "templates", label: "模板管理", hint: "模板列表与提取入口" },
  { key: "review", label: "文章审查", hint: "错别字与逻辑检查" },
  { key: "exports", label: "导出中心", hint: "HTML、Markdown、图片" },
  { key: "settings", label: "设置", hint: "模型、缓存、默认模板" },
];

type SidebarProps = {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
};

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const { projects, templates, currentProject } = useWorkspace();

  return (
    <aside className="sidebar">
      <div className="brand-panel">
        <p className="eyebrow">STEP 1 / SHELL</p>
        <h1>微信公众号 AI 排版工具</h1>
        <p className="brand-copy">
          先把可运行的桌面端骨架搭起来，再逐步接入模板、审查与导出。
        </p>
      </div>

      <nav className="nav-list" aria-label="主导航">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={item.key === currentView ? "nav-item active" : "nav-item"}
            onClick={() => onNavigate(item.key)}
            type="button"
          >
            <span className="nav-label">{item.label}</span>
            <span className="nav-hint">{item.hint}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-stats">
        <div>
          <strong>{projects.length}</strong>
          <span>项目</span>
        </div>
        <div>
          <strong>{templates.length}</strong>
          <span>模板</span>
        </div>
        <div>
          <strong>{currentProject?.sections.length ?? 0}</strong>
          <span>章节</span>
        </div>
      </div>

      <div className="sidebar-note">
        <span className="status-dot" />
        <span>当前存储：浏览器本地持久化</span>
      </div>
    </aside>
  );
}
