import type { AISettings, ArticleProject, ArticleSection, SectionType } from "../types";

type DraftSection = {
  type?: string;
  heading?: string;
  body?: string;
  points?: string[];
};

type GeneratedArticleDraft = Pick<ArticleProject, "title" | "summary" | "tags" | "sections"> & {
  providerLabel: string;
};

const supportedSectionTypes = new Set<SectionType>([
  "intro",
  "content",
  "quote",
  "highlight",
  "conclusion",
]);

function normalizeSectionType(type: string | undefined): SectionType {
  return supportedSectionTypes.has(type as SectionType) ? (type as SectionType) : "content";
}

function collectKeyPoints(project: ArticleProject) {
  const values = [
    ...project.sections.flatMap((section) => section.points ?? []),
    ...project.sections.map((section) => section.heading ?? "").filter(Boolean),
  ];

  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).slice(0, 5);
}

function buildMockDraft(project: ArticleProject): GeneratedArticleDraft {
  const keyPoints = collectKeyPoints(project);
  const sourceSections = project.sections.slice(0, 4);
  const title = project.title.includes("整理") ? project.title : `${project.title}｜公众号整理版`;
  const summary = project.summary || "这是一篇经 AI 重组后的公众号稿件初版，可继续编辑和排版。";

  const sections: ArticleSection[] = [
    {
      id: crypto.randomUUID(),
      type: "intro",
      heading: "开场导语",
      body: `${summary}\n\n下面这版内容已经按公众号阅读习惯重新组织，方便继续做模板排版和导出。`,
      points: keyPoints.slice(0, 3),
    },
    {
      id: crypto.randomUUID(),
      type: "highlight",
      heading: "先看重点",
      body: "如果你想先快速抓住这篇内容的主线，可以先看下面几个重点。",
      points: keyPoints.length > 0 ? keyPoints : ["补充文章核心看点", "补充关键结论", "补充适合强调的信息"],
    },
    ...sourceSections.map((section, index) => ({
      id: crypto.randomUUID(),
      type: index === sourceSections.length - 1 ? "content" : section.type,
      heading: section.heading?.trim() || `核心内容 ${index + 1}`,
      body: section.body.trim(),
      points: section.points?.filter(Boolean),
    })),
    {
      id: crypto.randomUUID(),
      type: "conclusion",
      heading: "结语",
      body: "这版内容已经完成基础重组，下一步可以继续微调语气、替换模板，并进入导出或审查流程。",
      points: ["检查语气是否符合目标账号", "确认模板是否匹配内容类型", "导出前再做一轮人工校对"],
    },
  ];

  return {
    title,
    summary,
    tags: Array.from(new Set([...project.tags, "AI重组"])),
    sections,
    providerLabel: "Mock 重组",
  };
}

function extractJsonString(content: string) {
  const trimmed = content.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  return trimmed;
}

function normalizeSections(rawSections: DraftSection[] | undefined): ArticleSection[] {
  const sections = (rawSections ?? [])
    .map((section) => ({
      id: crypto.randomUUID(),
      type: normalizeSectionType(section.type),
      heading: section.heading?.trim() || "未命名章节",
      body: section.body?.trim() || "待补充正文内容。",
      points: Array.isArray(section.points)
        ? section.points.map((item) => item.trim()).filter(Boolean)
        : undefined,
    }))
    .filter((section) => section.body || section.heading);

  return sections.length > 0
    ? sections
    : [
        {
          id: crypto.randomUUID(),
          type: "content",
          heading: "AI 重组结果",
          body: "模型没有返回有效章节，请检查模型配置后重试。",
        },
      ];
}

function buildPrompt(project: ArticleProject) {
  return [
    "请把下面的项目内容重组为适合微信公众号发布的结构化稿件。",
    "要求：",
    "1. 输出必须是 JSON，不要加解释。",
    "2. JSON 格式必须包含 title、summary、tags、sections 四个字段。",
    "3. sections 是数组，每项包含 type、heading、body、points。",
    "4. type 只能使用 intro、content、quote、highlight、conclusion。",
    "5. 保留原文关键信息，不要编造事实。",
    "6. 语气更适合公众号阅读，结构更清晰，适当补导语和结尾。",
    "",
    "当前项目数据：",
    JSON.stringify(
      {
        title: project.title,
        summary: project.summary,
        tags: project.tags,
        sections: project.sections.map((section) => ({
          type: section.type,
          heading: section.heading,
          body: section.body,
          points: section.points,
        })),
      },
      null,
      2,
    ),
  ].join("\n");
}

async function runOpenAICompatibleDraft(
  project: ArticleProject,
  settings: AISettings,
): Promise<GeneratedArticleDraft> {
  if (!settings.apiKey.trim()) {
    throw new Error("当前 provider 需要 API Key。请先去设置页填写后再重组。");
  }

  const baseUrl = settings.baseUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: settings.model.trim(),
      temperature: settings.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: settings.systemPrompt.trim(),
        },
        {
          role: "user",
          content: buildPrompt(project),
        },
      ],
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`模型调用失败：${response.status} ${rawText}`);
  }

  const payload = JSON.parse(rawText) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("模型没有返回可解析内容。");
  }

  const parsed = JSON.parse(extractJsonString(content)) as {
    title?: string;
    summary?: string;
    tags?: string[];
    sections?: DraftSection[];
  };

  return {
    title: parsed.title?.trim() || `${project.title}｜AI 重组稿`,
    summary: parsed.summary?.trim() || project.summary || "AI 已生成一版可继续编辑的公众号稿件。",
    tags: Array.from(
      new Set(
        [...(parsed.tags ?? []), ...project.tags]
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ),
    sections: normalizeSections(parsed.sections),
    providerLabel: `${settings.provider} / ${settings.model}`,
  };
}

export async function restructureArticle(
  project: ArticleProject,
  settings: AISettings,
): Promise<GeneratedArticleDraft> {
  if (settings.provider === "mock") {
    return buildMockDraft(project);
  }

  return runOpenAICompatibleDraft(project, settings);
}
