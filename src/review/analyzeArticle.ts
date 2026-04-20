import type { ArticleProject, ArticleSection, ReviewIssue, ReviewResult } from "../types";

const minimumSectionLength = 36;
const longParagraphLength = 180;

const conclusionPattern = /(总结|结语|结尾|结论|最后|收尾|下一步)/;
const placeholderPattern = /(TODO|todo|待补充|待完善|稍后补充|TBD)/;
const repeatedPunctuationPattern = /([!！?？。\.，,])\1{2,}/;
const repeatedWordPattern = /\b([a-zA-Z]{2,})\b(?:\s+\1\b)+/i;

type ReviewSuggestion = {
  key: string;
  text: string;
};

function createIssue(issue: Omit<ReviewIssue, "id">): ReviewIssue {
  return {
    id: crypto.randomUUID(),
    ...issue,
  };
}

function countOccurrences(text: string, keyword: string) {
  if (!keyword) {
    return 0;
  }

  return text.split(keyword).length - 1;
}

function normalizeHeading(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
}

function sectionText(section: ArticleSection) {
  return [section.heading, section.body, ...(section.points ?? [])]
    .filter(Boolean)
    .join("\n");
}

function getSectionLabel(section: ArticleSection, index: number) {
  return section.heading?.trim() || `章节 ${index + 1}`;
}

function buildDuplicateHeadingIssues(sections: ArticleSection[]) {
  const headingMap = new Map<string, number[]>();

  sections.forEach((section, index) => {
    const normalized = normalizeHeading(section.heading);

    if (!normalized) {
      return;
    }

    headingMap.set(normalized, [...(headingMap.get(normalized) ?? []), index]);
  });

  return Array.from(headingMap.entries()).flatMap(([normalized, indexes]) => {
    if (indexes.length < 2) {
      return [];
    }

    return [
      createIssue({
        type: "consistency",
        title: "存在重复章节标题",
        detail: `“${sections[indexes[0]]?.heading?.trim() || normalized}”在文章中重复出现，建议区分层级或改成更明确的标题。`,
        severity: indexes.length > 2 ? "high" : "medium",
        sectionId: sections[indexes[0]]?.id,
      }),
    ];
  });
}

function buildTerminologyIssues(text: string) {
  const issues: ReviewIssue[] = [];
  const suggestions: ReviewSuggestion[] = [];
  const terminologyPairs = [
    {
      canonical: "模板提取",
      alternative: "模板抽取",
      title: "模板相关术语不一致",
    },
    {
      canonical: "微信公众号",
      alternative: "公众号",
      title: "产品称呼存在混用",
    },
  ];

  terminologyPairs.forEach((pair) => {
    const canonicalCount = countOccurrences(text, pair.canonical);
    const alternativeCount = countOccurrences(text, pair.alternative);
    const effectiveAlternativeCount = pair.canonical.includes(pair.alternative)
      ? alternativeCount - canonicalCount
      : alternativeCount;

    if (canonicalCount > 0 && effectiveAlternativeCount > 0) {
      issues.push(
        createIssue({
          type: "consistency",
          title: pair.title,
          detail: `当前同时出现“${pair.canonical}”和“${pair.alternative}”，建议统一为一种表述。`,
          severity: "medium",
        }),
      );
      suggestions.push({
        key: `term-${pair.canonical}-${pair.alternative}`,
        text: `统一“${pair.canonical} / ${pair.alternative}”的术语写法，减少读者理解成本。`,
      });
    }
  });

  return { issues, suggestions };
}

function buildSectionIssues(sections: ArticleSection[]) {
  const issues: ReviewIssue[] = [];
  const suggestions: ReviewSuggestion[] = [];

  sections.forEach((section, index) => {
    const label = getSectionLabel(section, index);
    const text = sectionText(section);
    const paragraphs = section.body
      .split(/\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean);
    const bodyLength = section.body.trim().length;

    if (placeholderPattern.test(text)) {
      issues.push(
        createIssue({
          type: "logic",
          title: "章节内容仍是占位文案",
          detail: `${label} 中仍有“待补充 / TODO”之类的占位词，导出前需要补齐正式内容。`,
          severity: "high",
          sectionId: section.id,
        }),
      );
      suggestions.push({
        key: `placeholder-${section.id}`,
        text: `补齐 ${label} 的正式内容，避免占位文案进入最终稿。`,
      });
    }

    if (bodyLength > 0 && bodyLength < minimumSectionLength && (section.points?.length ?? 0) < 2) {
      issues.push(
        createIssue({
          type: "logic",
          title: "章节信息量偏少",
          detail: `${label} 当前内容较短，容易让读者感觉跳跃，建议补充背景、结论或关键示例。`,
          severity: "medium",
          sectionId: section.id,
        }),
      );
      suggestions.push({
        key: `short-${section.id}`,
        text: `补充 ${label} 的上下文或示例，降低表达断层。`,
      });
    }

    paragraphs.forEach((paragraph) => {
      if (paragraph.length > longParagraphLength) {
        issues.push(
          createIssue({
            type: "style",
            title: "段落偏长",
            detail: `${label} 中存在超长段落，建议拆成 2 到 3 段，提升公众号阅读节奏。`,
            severity: "medium",
            sectionId: section.id,
          }),
        );
        suggestions.push({
          key: `long-paragraph-${section.id}`,
          text: `拆分 ${label} 中过长的段落，让版面和阅读节奏更轻。`,
        });
      }

      if (repeatedPunctuationPattern.test(paragraph)) {
        issues.push(
          createIssue({
            type: "style",
            title: "标点使用过密",
            detail: `${label} 中出现连续重复标点，建议收敛情绪符号，保持专业表达。`,
            severity: "low",
            sectionId: section.id,
          }),
        );
        suggestions.push({
          key: `punctuation-${section.id}`,
          text: `清理 ${label} 中连续重复的感叹号或问号。`,
        });
      }

      if (repeatedWordPattern.test(paragraph)) {
        issues.push(
          createIssue({
            type: "typo",
            title: "疑似重复词",
            detail: `${label} 中出现连续重复的英文词汇，建议检查是否为误输入。`,
            severity: "low",
            sectionId: section.id,
          }),
        );
        suggestions.push({
          key: `repeat-word-${section.id}`,
          text: `检查 ${label} 中的重复词，避免错别字感。`,
        });
      }
    });

    if (/[\u4e00-\u9fff]\s{2,}[\u4e00-\u9fff]/.test(text)) {
      issues.push(
        createIssue({
          type: "typo",
          title: "中文间距异常",
          detail: `${label} 中存在异常空格，建议清理多余间距，避免影响排版观感。`,
          severity: "low",
          sectionId: section.id,
        }),
      );
      suggestions.push({
        key: `spacing-${section.id}`,
        text: `清理 ${label} 中多余的中文空格。`,
      });
    }
  });

  return { issues, suggestions };
}

function buildStructureIssues(project: ArticleProject) {
  const issues: ReviewIssue[] = [];
  const suggestions: ReviewSuggestion[] = [];
  const hasConclusion = project.sections.some((section) => {
    const sectionLabel = `${section.heading ?? ""}\n${section.body}`;

    return section.type === "conclusion" || conclusionPattern.test(sectionLabel);
  });

  if (!hasConclusion) {
    issues.push(
      createIssue({
        type: "logic",
        title: "缺少结尾收束",
        detail: "当前文章没有明显的总结或结尾章节，读者读完后可能拿不到明确结论。",
        severity: "medium",
      }),
    );
    suggestions.push({
      key: "missing-conclusion",
      text: "补一个结尾章节，回收核心观点并给出行动建议或下一步。",
    });
  }

  if (project.summary.trim().length < 24) {
    issues.push(
      createIssue({
        type: "style",
        title: "摘要信息不足",
        detail: "当前摘要较短，作为导语或封面说明时承载的信息不够完整。",
        severity: "low",
      }),
    );
    suggestions.push({
      key: "short-summary",
      text: "扩展项目摘要，让读者在开头更快理解文章价值。 ",
    });
  }

  if (project.sections.length < 3) {
    issues.push(
      createIssue({
        type: "logic",
        title: "整体结构偏薄",
        detail: "当前章节数量较少，文章可能还没形成完整的起承转合。",
        severity: "medium",
      }),
    );
    suggestions.push({
      key: "few-sections",
      text: "补足关键章节，让文章结构更完整。 ",
    });
  }

  return { issues, suggestions };
}

function dedupeSuggestions(items: ReviewSuggestion[]) {
  const unique = new Map<string, string>();

  items.forEach((item) => {
    unique.set(item.key, item.text.trim());
  });

  return Array.from(unique.values());
}

function sortIssues(issues: ReviewIssue[]) {
  const severityRank = {
    high: 0,
    medium: 1,
    low: 2,
  } as const;

  return [...issues].sort((left, right) => severityRank[left.severity] - severityRank[right.severity]);
}

export function analyzeArticle(project: ArticleProject): ReviewResult {
  const documentText = [
    project.title,
    project.summary,
    ...project.tags,
    ...project.sections.map((section) => sectionText(section)),
  ].join("\n");

  const terminology = buildTerminologyIssues(documentText);
  const sectionFindings = buildSectionIssues(project.sections);
  const structure = buildStructureIssues(project);
  const issues = sortIssues([
    ...buildDuplicateHeadingIssues(project.sections),
    ...terminology.issues,
    ...sectionFindings.issues,
    ...structure.issues,
  ]);
  const suggestions = dedupeSuggestions([
    ...terminology.suggestions,
    ...sectionFindings.suggestions,
    ...structure.suggestions,
  ]);

  return {
    lastReviewedAt: new Date().toISOString(),
    issues,
    suggestions,
  };
}
