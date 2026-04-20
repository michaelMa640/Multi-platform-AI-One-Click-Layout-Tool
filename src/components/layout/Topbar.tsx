import type { AppView } from "../../types";
import { useWorkspace } from "../../state/WorkspaceContext";

const titles: Record<AppView, { title: string; subtitle: string }> = {
  workspace: {
    title: "项目工作台",
    subtitle: "当前阶段先验证导入、编辑和预览的页面结构。",
  },
  templates: {
    title: "模板管理",
    subtitle: "保留内置模板、模板提取和变体生成的入口位置。",
  },
  review: {
    title: "文章审查",
    subtitle: "为错别字、逻辑问题和表达冲突预留审查结果界面。",
  },
  exports: {
    title: "导出中心",
    subtitle: "统一承接公众号 HTML、Markdown 和图片类导出。",
  },
  settings: {
    title: "设置",
    subtitle: "管理模型、工作区默认项和缓存策略。",
  },
};

type TopbarProps = {
  currentView: AppView;
};

export function Topbar({ currentView }: TopbarProps) {
  const content = titles[currentView];
  const { createProject, saveWorkspace, currentProject, lastSavedAt } = useWorkspace();

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">V1 FOUNDATION</p>
        <h2>{content.title}</h2>
        <p className="topbar-copy">{content.subtitle}</p>
        {currentProject ? (
          <p className="topbar-meta">
            当前项目：{currentProject.title}
            {lastSavedAt ? ` · 上次保存 ${new Date(lastSavedAt).toLocaleString("zh-CN")}` : " · 尚未保存"}
          </p>
        ) : null}
      </div>

      <div className="topbar-actions">
        <button className="ghost-button" onClick={createProject} type="button">
          新建项目
        </button>
        <button className="primary-button" onClick={saveWorkspace} type="button">
          保存工作区
        </button>
      </div>
    </header>
  );
}
