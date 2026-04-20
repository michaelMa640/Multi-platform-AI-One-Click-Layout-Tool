import { builtInTemplates } from "./templates";
import { analyzeArticle } from "../review/analyzeArticle";
import type {
  ArticleProject,
  PersistedWorkspace,
  WorkspaceState,
} from "../types";

export function createSeedProject(templateId = builtInTemplates[0].id): ArticleProject {
  const now = new Date().toISOString();

  const project: ArticleProject = {
    id: crypto.randomUUID(),
    sourceType: "markdown",
    title: "微信公众号 AI 排版工具 V1 工作项目",
    summary:
      "用于承接 Step 2 的统一数据结构、项目存储、模板与审查结果，让后续导入解析和模板渲染有稳定落点。",
    tags: ["V1", "桌面端", "模板系统"],
    styleTemplateId: templateId,
    sections: [
      {
        id: crypto.randomUUID(),
        type: "intro",
        heading: "当前阶段目标",
        body: "先把统一数据结构和本地持久化建起来，让项目、模板和审查结果都能稳定保存和恢复。",
        points: ["项目可创建与恢复", "模板内置数据可读取", "审查结果可挂载在项目上"],
      },
      {
        id: crypto.randomUUID(),
        type: "content",
        heading: "Step 2 实际范围",
        body: "本步先使用浏览器端 localStorage 完成持久化，等 Tauri 运行时补齐后再切换到本地文件或 SQLite。",
        points: ["ArticleProject 数据模型", "TemplateDefinition 数据模型", "PersistedWorkspace 存储结构"],
      },
      {
        id: crypto.randomUUID(),
        type: "highlight",
        heading: "当前结论",
        body: "前端骨架已经就位，现在可以把数据层接上，为 Step 3 的导入与解析提供真实存储容器。",
      },
    ],
    platformVariants: [
      { platform: "wechat", format: "html", status: "draft" },
      { platform: "xiaohongshu", format: "image_set", status: "draft" },
    ],
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...project,
    reviewResult: analyzeArticle(project),
  };
}

export function createInitialWorkspaceState(): WorkspaceState {
  const project = createSeedProject();

  return {
    currentProjectId: project.id,
    projects: [project],
    templates: builtInTemplates,
    hydrated: true,
    lastSavedAt: undefined,
  };
}

export function toPersistedWorkspace(state: WorkspaceState): PersistedWorkspace {
  return {
    version: 1,
    currentProjectId: state.currentProjectId,
    projects: state.projects,
    templates: state.templates,
    lastSavedAt: state.lastSavedAt,
  };
}
