import type { TemplateDefinition, TemplateLayout } from "../types";

export type TemplateExtractionResult =
  | {
      ok: true;
      reason: string;
      template: TemplateDefinition;
    }
  | {
      ok: false;
      reason: string;
    };

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function inferLayout(documentNode: Document): TemplateLayout {
  const cardLikeCount = documentNode.querySelectorAll(".card, .item, article, [class*='card']").length;
  const quoteCount = documentNode.querySelectorAll("blockquote").length;
  const headingCount = documentNode.querySelectorAll("h2, h3").length;

  if (cardLikeCount >= 6) {
    return "cards";
  }

  if (quoteCount >= 2 || documentNode.querySelectorAll("ol li").length >= 4) {
    return "spotlight";
  }

  if (headingCount >= 3) {
    return "editorial";
  }

  return "cards";
}

function buildComponents(layout: TemplateLayout) {
  switch (layout) {
    case "cards":
      return ["hero_profile_card", "content_roadmap", "card_sections", "pill_subheading"];
    case "spotlight":
      return ["spotlight_cover", "signal_metrics", "timeline_sections", "highlight_panels"];
    case "editorial":
    default:
      return ["hero_title_block", "editorial_sections", "quote_break", "closing_summary"];
  }
}

function buildTheme(layout: TemplateLayout) {
  switch (layout) {
    case "cards":
      return {
        primary: "#5D8960",
        primarySoft: "#EEF4EC",
        accent: "#F4DF72",
        background: "#FFFFFF",
        textMain: "#222222",
      };
    case "spotlight":
      return {
        primary: "#4B6D8F",
        primarySoft: "#EEF3F8",
        accent: "#D9BF6A",
        background: "#FAFBFC",
        textMain: "#1F2933",
      };
    case "editorial":
    default:
      return {
        primary: "#E8590C",
        primarySoft: "#FFF4EB",
        accent: "#1D1D1F",
        background: "#FAFAFA",
        textMain: "#1D1D1F",
      };
  }
}

function buildUseCases(layout: TemplateLayout) {
  switch (layout) {
    case "cards":
      return ["工具教程", "产品更新", "步骤型内容"];
    case "spotlight":
      return ["方法拆解", "重点提示", "时间线内容"];
    case "editorial":
    default:
      return ["专题评论", "行业洞察", "叙事型长文"];
  }
}

function canExtract(documentNode: Document) {
  const headingCount = documentNode.querySelectorAll("h1, h2, h3").length;
  const paragraphCount = documentNode.querySelectorAll("p").length;
  const repeatedModules =
    documentNode.querySelectorAll("section, article, .card, .item, li").length;

  if (headingCount < 2) {
    return {
      ok: false as const,
      reason: "页面缺少足够稳定的标题层级，暂时不适合抽取为模板。",
    };
  }

  if (paragraphCount < 4 && repeatedModules < 6) {
    return {
      ok: false as const,
      reason: "页面内容模块数量不足，暂时看不出可复用的排版结构。",
    };
  }

  return {
    ok: true as const,
    reason: "页面存在较稳定的标题和内容模块，可先生成模板草稿。",
  };
}

export async function extractTemplateFromUrl(url: string): Promise<TemplateExtractionResult> {
  const target = url.trim();

  if (!target) {
    return {
      ok: false,
      reason: "请输入要提取模板的链接。",
    };
  }

  let response: Response;

  try {
    response = await fetch(target);
  } catch {
    return {
      ok: false,
      reason: "链接请求失败，当前可能受到浏览器跨域限制。后续可考虑迁移到 Tauri / Rust 侧抓取。",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: `链接请求失败：${response.status} ${response.statusText}`,
    };
  }

  const html = await response.text();
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, "text/html");
  const decision = canExtract(documentNode);

  if (!decision.ok) {
    return decision;
  }

  const layout = inferLayout(documentNode);
  const title =
    normalizeText(documentNode.querySelector("title")?.textContent ?? "") ||
    normalizeText(documentNode.querySelector("h1")?.textContent ?? "") ||
    "提取模板草稿";
  const now = new Date().toISOString();

  return {
    ok: true,
    reason: decision.reason,
    template: {
      id: crypto.randomUUID(),
      name: `${title} 模板草稿`,
      kind: "extracted",
      status: "draft",
      layout,
      summary: `从 ${target} 提取的模板草稿，建议继续人工检查组件映射与样式变量。`,
      useCases: buildUseCases(layout),
      components: buildComponents(layout),
      supportsExtraction: false,
      theme: buildTheme(layout),
      createdAt: now,
      updatedAt: now,
    },
  };
}
