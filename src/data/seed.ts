import { builtInTemplates } from "./templates";
import type {
  ArticleProject,
  PersistedWorkspace,
  ReviewIssue,
  WorkspaceState,
} from "../types";

function buildSeedIssues(): ReviewIssue[] {
  return [
    {
      id: crypto.randomUUID(),
      type: "typo",
      title: "检查术语一致性",
      detail: "“模板提取”与“模板抽取”建议统一用词，避免页面内表达来回切换。",
      severity: "low",
    },
    {
      id: crypto.randomUUID(),
      type: "logic",
      title: "补充导出闭环说明",
      detail: "在介绍多平台能力时，建议明确“先 HTML/CSS，再导出图片”的统一路径。",
      severity: "medium",
    },
    {
      id: crypto.randomUUID(),
      type: "consistency",
      title: "补充 DOC 导入限制",
      detail: "建议在产品说明中强调 DOC 优先走转换兼容，避免用户误解为与 DOCX 同等稳定。",
      severity: "medium",
    },
  ];
}

export function createSeedProject(templateId = builtInTemplates[0].id): ArticleProject {
  const now = new Date().toISOString();

  return {
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
    reviewResult: {
      lastReviewedAt: now,
      issues: buildSeedIssues(),
      suggestions: [
        "在模板管理页增加模板来源和状态标签。",
        "在项目工作台展示最后保存时间和当前模板名。",
      ],
    },
    platformVariants: [
      { platform: "wechat", format: "html", status: "draft" },
      { platform: "xiaohongshu", format: "image_set", status: "draft" },
    ],
    createdAt: now,
    updatedAt: now,
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
