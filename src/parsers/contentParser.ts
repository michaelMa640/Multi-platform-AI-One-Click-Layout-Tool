import type { ArticleSection, SectionType } from "../types";

export type ParsedDocument = {
  title: string;
  summary: string;
  tags: string[];
  sections: ArticleSection[];
};

type SectionDraft = {
  heading?: string;
  type: SectionType;
  paragraphs: string[];
  points: string[];
};

function normalizeText(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").trim();
}

function splitParagraphs(text: string) {
  return normalizeText(text)
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createSection({
  heading,
  type,
  paragraphs,
  points,
}: SectionDraft): ArticleSection | null {
  const body = paragraphs.join("\n\n").trim();

  if (!heading && !body && points.length === 0) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    type,
    heading,
    body: body || points.join(" / "),
    points: points.length > 0 ? points : undefined,
  };
}

function finalizeSections(drafts: SectionDraft[]) {
  return drafts
    .map((draft) => createSection(draft))
    .filter((section): section is ArticleSection => section !== null);
}

function inferSummary(paragraphs: string[]) {
  return paragraphs.find(Boolean) ?? "导入内容后生成的摘要待补充。";
}

export function parsePlainText(text: string): ParsedDocument {
  const paragraphs = splitParagraphs(text);
  const title = paragraphs[0] ?? "未命名文本导入";
  const summary = inferSummary(paragraphs.slice(1));
  const sections = paragraphs.slice(1).map((paragraph, index) => ({
    id: crypto.randomUUID(),
    type: index === 0 ? ("intro" as const) : ("content" as const),
    heading: index === 0 ? "导入概览" : `段落 ${index + 1}`,
    body: paragraph,
  }));

  return {
    title,
    summary,
    tags: ["文本导入"],
    sections:
      sections.length > 0
        ? sections
        : [
            {
              id: crypto.randomUUID(),
              type: "intro",
              heading: "导入内容",
              body: title,
            },
          ],
  };
}

export function parseMarkdown(markdown: string): ParsedDocument {
  const normalized = normalizeText(markdown);
  const lines = normalized.split("\n");
  const nonEmptyLines = lines.map((line) => line.trim()).filter(Boolean);

  const title =
    nonEmptyLines.find((line) => line.startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim() ??
    nonEmptyLines[0] ??
    "未命名 Markdown 导入";

  const drafts: SectionDraft[] = [];
  let current: SectionDraft = {
    heading: "导入概览",
    type: "intro",
    paragraphs: [],
    points: [],
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith("# ")) {
      continue;
    }

    if (line.startsWith("## ")) {
      drafts.push(current);
      current = {
        heading: line.replace(/^##\s+/, "").trim(),
        type: drafts.length === 0 ? "intro" : "content",
        paragraphs: [],
        points: [],
      };
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      current.points.push(line.slice(2).trim());
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      current.points.push(line.replace(/^\d+\.\s+/, "").trim());
      continue;
    }

    current.paragraphs.push(line);
  }

  drafts.push(current);

  const sections = finalizeSections(drafts);

  return {
    title,
    summary: inferSummary(
      sections.flatMap((section) => [section.body, ...(section.points ?? [])]),
    ),
    tags: ["Markdown 导入"],
    sections:
      sections.length > 0
        ? sections
        : [
            {
              id: crypto.randomUUID(),
              type: "intro",
              heading: "导入内容",
              body: normalized,
            },
          ],
  };
}

function getTextContent(element: Element | null) {
  return normalizeText(element?.textContent ?? "");
}

export function parseHtml(html: string): ParsedDocument {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, "text/html");
  const body = documentNode.body;
  const title =
    getTextContent(body.querySelector("h1")) ||
    normalizeText(documentNode.title) ||
    "未命名 HTML 导入";

  const drafts: SectionDraft[] = [];
  let current: SectionDraft = {
    heading: "导入概览",
    type: "intro",
    paragraphs: [],
    points: [],
  };

  const candidates = body.querySelectorAll("h2, h3, p, li, blockquote");

  candidates.forEach((node) => {
    const text = getTextContent(node);

    if (!text) {
      return;
    }

    if (node.tagName === "H2" || node.tagName === "H3") {
      drafts.push(current);
      current = {
        heading: text,
        type: drafts.length === 0 ? "intro" : "content",
        paragraphs: [],
        points: [],
      };
      return;
    }

    if (node.tagName === "LI") {
      current.points.push(text);
      return;
    }

    if (node.tagName === "BLOCKQUOTE") {
      drafts.push(current);
      drafts.push({
        heading: "引用内容",
        type: "quote",
        paragraphs: [text],
        points: [],
      });
      current = {
        heading: "补充说明",
        type: "content",
        paragraphs: [],
        points: [],
      };
      return;
    }

    current.paragraphs.push(text);
  });

  drafts.push(current);

  const sections = finalizeSections(drafts);
  const firstParagraph = getTextContent(body.querySelector("p"));

  return {
    title,
    summary: firstParagraph || inferSummary(sections.map((section) => section.body)),
    tags: ["HTML 导入"],
    sections:
      sections.length > 0
        ? sections
        : [
            {
              id: crypto.randomUUID(),
              type: "intro",
              heading: "导入内容",
              body: normalizeText(body.textContent ?? ""),
            },
          ],
  };
}
