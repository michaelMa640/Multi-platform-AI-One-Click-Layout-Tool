export type AppView =
  | "workspace"
  | "templates"
  | "review"
  | "exports"
  | "settings";

export type NavItem = {
  key: AppView;
  label: string;
  hint: string;
};

export type MetricCard = {
  label: string;
  value: string;
  detail: string;
};

export type SourceType =
  | "url"
  | "markdown"
  | "txt"
  | "html"
  | "doc"
  | "docx";

export type SectionType =
  | "intro"
  | "content"
  | "quote"
  | "highlight"
  | "conclusion";

export type ReviewIssueType =
  | "typo"
  | "logic"
  | "consistency"
  | "style";

export type ImportStatus = "idle" | "success" | "error";

export type TemplateKind = "builtin" | "extracted" | "variant" | "draft";

export type TemplateStatus = "active" | "disabled" | "draft";

export type TemplateLayout = "editorial" | "cards" | "spotlight";

export type PlatformName =
  | "wechat"
  | "xiaohongshu"
  | "weibo"
  | "linkedin"
  | "instagram"
  | "x"
  | "facebook";

export type PlatformFormat = "html" | "article" | "carousel" | "image_set";

export type AIProvider = "mock" | "openai-compatible";

export type ArticleSection = {
  id: string;
  type: SectionType;
  heading?: string;
  body: string;
  points?: string[];
  stats?: Array<{ label: string; value: string }>;
};

export type ReviewIssue = {
  id: string;
  type: ReviewIssueType;
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
  sectionId?: string;
};

export type ReviewResult = {
  lastReviewedAt?: string;
  issues: ReviewIssue[];
  suggestions: string[];
};

export type PlatformVariant = {
  platform: PlatformName;
  format: PlatformFormat;
  status: "draft" | "generated" | "reviewed";
};

export type ArticleProject = {
  id: string;
  sourceType: SourceType;
  title: string;
  summary: string;
  sourceName?: string;
  sourceUrl?: string;
  coverImage?: string;
  tags: string[];
  styleTemplateId: string;
  sections: ArticleSection[];
  reviewResult?: ReviewResult;
  platformVariants: PlatformVariant[];
  createdAt: string;
  updatedAt: string;
};

export type TemplateTheme = {
  primary: string;
  primarySoft: string;
  accent: string;
  background: string;
  textMain: string;
};

export type TemplateDefinition = {
  id: string;
  name: string;
  kind: TemplateKind;
  status: TemplateStatus;
  layout: TemplateLayout;
  summary: string;
  useCases: string[];
  components: string[];
  supportsExtraction: boolean;
  theme: TemplateTheme;
  createdAt: string;
  updatedAt: string;
};

export type PersistedWorkspace = {
  version: 1;
  currentProjectId: string;
  projects: ArticleProject[];
  templates: TemplateDefinition[];
  lastSavedAt?: string;
};

export type WorkspaceState = {
  currentProjectId: string;
  projects: ArticleProject[];
  templates: TemplateDefinition[];
  hydrated: boolean;
  lastSavedAt?: string;
};

export type WorkspaceContextValue = WorkspaceState & {
  currentProject: ArticleProject | undefined;
  createProject: () => void;
  importProject: (project: ArticleProject) => void;
  addTemplate: (template: TemplateDefinition) => void;
  selectProject: (projectId: string) => void;
  updateProjectMeta: (
    patch: Partial<Pick<ArticleProject, "title" | "summary" | "sourceType" | "sourceUrl">>,
  ) => void;
  updateProjectTags: (tags: string[]) => void;
  updateProjectTemplate: (templateId: string) => void;
  updateTemplateStatus: (templateId: string, status: TemplateStatus) => void;
  duplicateTemplate: (templateId: string) => void;
  updateProjectSection: (
    sectionId: string,
    patch: Partial<Pick<ArticleSection, "type" | "heading" | "body" | "points">>,
  ) => void;
  applyProjectDraft: (
    patch: Pick<ArticleProject, "title" | "summary" | "tags" | "sections">,
  ) => void;
  addProjectSection: () => void;
  removeProjectSection: (sectionId: string) => void;
  moveProjectSection: (sectionId: string, direction: "up" | "down") => void;
  saveWorkspace: () => void;
  resetWorkspace: () => void;
};

export type AISettings = {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl: string;
  temperature: number;
  systemPrompt: string;
};
