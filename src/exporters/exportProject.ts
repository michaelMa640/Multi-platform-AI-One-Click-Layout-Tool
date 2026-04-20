import { builtInTemplates } from "../data/templates";
import type { ArticleProject, ArticleSection, TemplateDefinition } from "../types";

export type ProjectExportBundle = {
  html: string;
  markdown: string;
  snapshot: string;
  fileBaseName: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeFileName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s_/]+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "wechat-article";
}

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return `rgba(93, 137, 96, ${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderMarkdownSection(section: ArticleSection) {
  const heading = section.heading?.trim() || "未命名章节";
  const lines = [`## ${heading}`, "", section.body.trim() || "待补充正文"];

  if (section.points && section.points.length > 0) {
    lines.push("", ...section.points.map((point) => `- ${point}`));
  }

  return lines.join("\n");
}

function renderMarkdown(project: ArticleProject) {
  const lines = [
    `# ${project.title}`,
    "",
    project.summary.trim(),
    "",
    project.tags.length > 0 ? `标签：${project.tags.map((tag) => `#${tag}`).join(" ")}` : "",
    "",
    ...project.sections.map((section) => renderMarkdownSection(section)),
  ].filter(Boolean);

  return `${lines.join("\n")}\n`;
}

function renderHtmlParagraphs(section: ArticleSection) {
  const paragraphs = splitParagraphs(section.body);

  if (paragraphs.length === 0) {
    return "<p>待补充正文</p>";
  }

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function renderHtmlPoints(section: ArticleSection) {
  if (!section.points || section.points.length === 0) {
    return "";
  }

  return `
    <ul class="points">
      ${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
    </ul>
  `;
}

function renderHtmlSection(section: ArticleSection, index: number) {
  const heading = section.heading?.trim() || `章节 ${index + 1}`;

  return `
    <section class="section section-${section.type}">
      <div class="section-head">
        <span class="section-index">${String(index + 1).padStart(2, "0")}</span>
        <div>
          <p class="section-type">${escapeHtml(section.type.toUpperCase())}</p>
          <h2>${escapeHtml(heading)}</h2>
        </div>
      </div>
      <div class="section-body">
        ${renderHtmlParagraphs(section)}
      </div>
      ${renderHtmlPoints(section)}
    </section>
  `;
}

function resolveTemplate(project: ArticleProject) {
  return builtInTemplates.find((template) => template.id === project.styleTemplateId);
}

function renderHtml(project: ArticleProject, template: TemplateDefinition | undefined) {
  const primary = template?.theme.primary ?? "#5D8960";
  const primarySoft = template?.theme.primarySoft ?? "#EEF4EC";
  const accent = template?.theme.accent ?? "#F4DF72";
  const background = template?.theme.background ?? "#FFFFFF";
  const textMain = template?.theme.textMain ?? "#222222";

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(project.title)}</title>
    <style>
      :root {
        color-scheme: light;
        --primary: ${primary};
        --primary-soft: ${primarySoft};
        --accent: ${accent};
        --background: ${background};
        --text-main: ${textMain};
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 32px 0;
        background: #eef3ea;
        color: var(--text-main);
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        line-height: 1.75;
      }

      .article {
        width: calc(100% - 32px);
        max-width: 760px;
        margin: 0 auto;
        padding: 24px;
        background: linear-gradient(180deg, var(--background), #ffffff);
        border-radius: 28px;
        box-shadow: 0 22px 48px rgba(39, 62, 40, 0.12);
      }

      .hero {
        padding: 28px 24px;
        border-radius: 24px;
        background: var(--primary);
        color: white;
      }

      .eyebrow {
        margin: 0 0 8px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1.6px;
        opacity: 0.8;
      }

      h1 {
        margin: 0 0 12px;
        font-size: 32px;
        line-height: 1.2;
      }

      .summary {
        margin: 0;
        font-size: 15px;
        color: rgba(255, 255, 255, 0.9);
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }

      .tags span {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
        font-size: 12px;
        font-weight: 700;
      }

      .meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin: 18px 0 0;
      }

      .meta-item {
        padding: 14px 16px;
        border-radius: 18px;
        background: var(--primary-soft);
      }

      .meta-item strong {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
      }

      .meta-item span {
        font-size: 13px;
        color: #556456;
      }

      .content {
        margin-top: 22px;
        display: grid;
        gap: 16px;
      }

      .section {
        padding: 20px;
        border-radius: 22px;
        background: #ffffff;
        border: 1px solid ${withAlpha(primary, 0.14)};
      }

      .section-quote {
        border-left: 4px solid var(--primary);
      }

      .section-highlight {
        background: ${withAlpha(accent, 0.12)};
      }

      .section-conclusion {
        background: var(--primary-soft);
      }

      .section-head {
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }

      .section-index {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        height: 44px;
        border-radius: 16px;
        background: ${withAlpha(primary, 0.12)};
        color: var(--primary);
        font-weight: 800;
      }

      .section-type {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #738172;
      }

      h2 {
        margin: 6px 0 0;
        font-size: 22px;
        line-height: 1.3;
      }

      .section-body p {
        margin: 14px 0 0;
      }

      .points {
        margin: 14px 0 0;
        padding-left: 18px;
      }

      .points li + li {
        margin-top: 8px;
      }
    </style>
  </head>
  <body>
    <article class="article">
      <header class="hero">
        <p class="eyebrow">WECHAT EXPORT</p>
        <h1>${escapeHtml(project.title)}</h1>
        <p class="summary">${escapeHtml(project.summary)}</p>
        <div class="tags">
          ${(project.tags.length > 0 ? project.tags : ["待补充标签"])
            .map((tag) => `<span>${escapeHtml(tag)}</span>`)
            .join("")}
        </div>
      </header>
      <section class="meta">
        <div class="meta-item">
          <strong>模板</strong>
          <span>${escapeHtml(template?.name ?? project.styleTemplateId)}</span>
        </div>
        <div class="meta-item">
          <strong>章节</strong>
          <span>${project.sections.length} 个</span>
        </div>
        <div class="meta-item">
          <strong>来源</strong>
          <span>${escapeHtml(project.sourceType.toUpperCase())}</span>
        </div>
      </section>
      <main class="content">
        ${project.sections.map((section, index) => renderHtmlSection(section, index)).join("")}
      </main>
    </article>
  </body>
</html>
`;
}

export function buildProjectExportBundle(project: ArticleProject): ProjectExportBundle {
  const template = resolveTemplate(project);
  const fileBaseName = normalizeFileName(project.title);

  return {
    html: renderHtml(project, template),
    markdown: renderMarkdown(project),
    snapshot: `${JSON.stringify(project, null, 2)}\n`,
    fileBaseName,
  };
}
