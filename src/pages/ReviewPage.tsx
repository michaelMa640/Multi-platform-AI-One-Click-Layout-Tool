import { useWorkspace } from "../state/WorkspaceContext";

export function ReviewPage() {
  const { currentProject } = useWorkspace();
  const issues = currentProject?.reviewResult?.issues ?? [];

  return (
    <section className="page-grid">
      <article className="panel-card emphasis">
        <div className="panel-heading">
          <p className="eyebrow">REVIEW ENGINE</p>
          <h4>文章审查结果页骨架</h4>
        </div>
        <p className="panel-copy">
          这一步先把结果页样式位置固定下来，后面接入模型审查和规则检查时不会返工。
        </p>
      </article>

      <div className="review-list">
        {issues.map((issue, index) => (
          <article key={issue.id} className="review-card">
            <span className="review-index">{`0${index + 1}`}</span>
            <div>
              <h4>{issue.title}</h4>
              <p>
                [{issue.type} / {issue.severity}] {issue.detail}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
