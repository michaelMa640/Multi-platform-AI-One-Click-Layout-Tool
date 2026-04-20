import { startTransition, useEffect, useMemo, useState } from "react";
import { analyzeArticle } from "../review/analyzeArticle";
import { useWorkspace } from "../state/WorkspaceContext";
import type { ReviewIssue, ReviewIssueType } from "../types";

const issueTypeLabels: Record<ReviewIssueType, string> = {
  typo: "错别字 / 细节",
  logic: "逻辑",
  consistency: "一致性",
  style: "表达风格",
};

const severityLabels: Record<ReviewIssue["severity"], string> = {
  high: "高优先级",
  medium: "中优先级",
  low: "低优先级",
};

function formatReviewTime(value?: string) {
  if (!value) {
    return "还没有执行过审查";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ReviewPage() {
  const { currentProject, updateProjectReviewResult } = useWorkspace();
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("当前还没有重新执行文章审查。");

  const reviewResult = currentProject?.reviewResult;
  const issues = reviewResult?.issues ?? [];
  const suggestions = reviewResult?.suggestions ?? [];

  const metrics = useMemo(() => {
    const highCount = issues.filter((issue) => issue.severity === "high").length;
    const sectionCount = new Set(issues.map((issue) => issue.sectionId).filter(Boolean)).size;

    return [
      {
        label: "问题总数",
        value: `${issues.length} 条`,
        detail: "按本地规则引擎重新扫描当前文章",
      },
      {
        label: "高优先级",
        value: `${highCount} 条`,
        detail: "优先处理占位文案、严重结构缺失等问题",
      },
      {
        label: "涉及章节",
        value: `${sectionCount} 个`,
        detail: "问题可回溯到对应章节或全局结构",
      },
      {
        label: "优化建议",
        value: `${suggestions.length} 条`,
        detail: "用于导出前的统一补强清单",
      },
    ];
  }, [issues, suggestions.length]);

  useEffect(() => {
    if (!reviewResult?.lastReviewedAt) {
      setReviewMessage("当前还没有重新执行文章审查。");
      return;
    }

    setReviewMessage(
      reviewResult.issues.length > 0
        ? `最近一次审查共发现 ${reviewResult.issues.length} 个问题点。`
        : "最近一次审查没有命中明显问题。",
    );
  }, [reviewResult]);

  if (!currentProject) {
    return null;
  }

  const runReview = async () => {
    setIsReviewing(true);
    setReviewMessage("正在基于当前项目内容执行规则审查...");

    try {
      const result = analyzeArticle(currentProject);

      startTransition(() => {
        updateProjectReviewResult(result);
      });

      setReviewMessage(
        result.issues.length > 0
          ? `已完成审查，当前发现 ${result.issues.length} 个问题点。`
          : "已完成审查，当前没有命中明显问题。",
      );
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <section className="page-grid">
      <div className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">REVIEW ENGINE</p>
          <h3>导出前先做一轮本地审查，把结构、表达和一致性问题提前拦下来</h3>
          <p>
            当前审查引擎会基于项目标题、摘要、章节和要点做规则扫描，给出问题类型、关联章节和修订建议，方便你在正式导出前快速补齐。
          </p>
        </div>

        <div className="review-hero-actions">
          <div className="review-status-pill">
            <strong>最近审查</strong>
            <span>{formatReviewTime(reviewResult?.lastReviewedAt)}</span>
          </div>
          <button className="primary-button" disabled={isReviewing} onClick={runReview} type="button">
            {isReviewing ? "审查中..." : "重新审查当前文章"}
          </button>
        </div>
      </div>

      <div className="metric-row review-metric-row">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </article>
        ))}
      </div>

      <div className="review-layout">
        <article className="panel-card review-sidebar-card">
          <div className="panel-heading">
            <p className="eyebrow">STATUS</p>
            <h4>本轮审查摘要</h4>
          </div>
          <p className="panel-copy review-status-copy">{reviewMessage}</p>

          <div className="review-type-list">
            {Object.entries(issueTypeLabels).map(([type, label]) => {
              const count = issues.filter((issue) => issue.type === type).length;

              return (
                <div key={type} className="review-type-item">
                  <strong>{count}</strong>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>

          <div className="panel-heading review-suggestion-heading">
            <p className="eyebrow">SUGGESTIONS</p>
            <h4>优先修订建议</h4>
          </div>
          {suggestions.length > 0 ? (
            <ul className="feature-list review-suggestion-list">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          ) : (
            <p className="panel-copy">当前没有额外建议，可以继续进入导出准备。</p>
          )}
        </article>

        <div className="review-results">
          {issues.length > 0 ? (
            <div className="review-list">
              {issues.map((issue, index) => {
                const relatedSection = currentProject.sections.find((section) => section.id === issue.sectionId);

                return (
                  <article key={issue.id} className={`review-card review-card-${issue.severity}`}>
                    <span className="review-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="review-card-body">
                      <div className="review-card-top">
                        <h4>{issue.title}</h4>
                        <div className="review-badges">
                          <span className={`review-badge review-badge-${issue.type}`}>{issueTypeLabels[issue.type]}</span>
                          <span className={`review-badge review-badge-${issue.severity}`}>
                            {severityLabels[issue.severity]}
                          </span>
                        </div>
                      </div>
                      <p>{issue.detail}</p>
                      <div className="review-issue-meta">
                        <strong>定位章节</strong>
                        <span>{relatedSection?.heading?.trim() || "全局结构 / 摘要"}</span>
                      </div>
                      {relatedSection ? (
                        <div className="review-snippet">
                          {(relatedSection.body || "").trim().slice(0, 120)}
                          {(relatedSection.body || "").trim().length > 120 ? "..." : ""}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <article className="panel-card review-empty-card">
              <div className="panel-heading">
                <p className="eyebrow">RESULT</p>
                <h4>当前没有命中明显问题</h4>
              </div>
              <p className="panel-copy">
                这说明当前文章至少通过了本地规则的基础检查。你仍然可以在导出前再人工过一遍语气、事实和平台适配细节。
              </p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
