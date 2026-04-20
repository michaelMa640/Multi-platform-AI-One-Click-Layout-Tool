import mammoth from "mammoth";
import { builtInTemplates } from "../data/templates";
import { parseHtml, parseMarkdown, parsePlainText, type ParsedDocument } from "../parsers/contentParser";
import type { ArticleProject, SourceType } from "../types";

export type ImportPayload =
  | { kind: "url"; value: string }
  | { kind: "text"; sourceType: Extract<SourceType, "markdown" | "txt" | "html">; value: string }
  | { kind: "file"; file: File };

function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map((item) => item.trim()).filter(Boolean)));
}

function buildProjectFromParsed(
  parsed: ParsedDocument,
  sourceType: SourceType,
  sourceName?: string,
  sourceUrl?: string,
): ArticleProject {
  const now = new Date().toISOString();
  const templateId = builtInTemplates[0]?.id ?? "magazine-editorial";

  return {
    id: crypto.randomUUID(),
    sourceType,
    title: parsed.title,
    summary: parsed.summary,
    sourceName,
    sourceUrl,
    tags: normalizeTags(parsed.tags),
    styleTemplateId: templateId,
    sections: parsed.sections,
    reviewResult: {
      lastReviewedAt: undefined,
      issues: [],
      suggestions: [],
    },
    platformVariants: [
      { platform: "wechat", format: "html", status: "draft" },
      { platform: "xiaohongshu", format: "image_set", status: "draft" },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

async function parseDocx(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return parseHtml(result.value);
}

function getExtension(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) ?? "" : "";
}

async function importFromFile(file: File): Promise<ArticleProject> {
  const extension = getExtension(file.name);

  if (extension === "doc") {
    throw new Error("DOC 暂时不直接解析，请先另存为 DOCX 后再导入。");
  }

  if (extension === "docx") {
    const parsed = await parseDocx(file);
    return buildProjectFromParsed(parsed, "docx", file.name);
  }

  const text = await file.text();

  if (extension === "md" || extension === "markdown") {
    return buildProjectFromParsed(parseMarkdown(text), "markdown", file.name);
  }

  if (extension === "html" || extension === "htm") {
    return buildProjectFromParsed(parseHtml(text), "html", file.name);
  }

  if (extension === "txt") {
    return buildProjectFromParsed(parsePlainText(text), "txt", file.name);
  }

  throw new Error(`暂不支持该文件类型：${file.name}`);
}

async function importFromUrl(url: string): Promise<ArticleProject> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`URL 获取失败：${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const parsed = parseHtml(html);

  return buildProjectFromParsed(parsed, "url", url, url);
}

export async function importArticle(payload: ImportPayload): Promise<ArticleProject> {
  if (payload.kind === "file") {
    return importFromFile(payload.file);
  }

  if (payload.kind === "url") {
    const value = payload.value.trim();

    if (!value) {
      throw new Error("请输入要导入的 URL。");
    }

    return importFromUrl(value);
  }

  const value = payload.value.trim();

  if (!value) {
    throw new Error("请输入要导入的内容。");
  }

  if (payload.sourceType === "markdown") {
    return buildProjectFromParsed(parseMarkdown(value), "markdown");
  }

  if (payload.sourceType === "html") {
    return buildProjectFromParsed(parseHtml(value), "html");
  }

  return buildProjectFromParsed(parsePlainText(value), "txt");
}
