import { useWorkspace } from "../state/WorkspaceContext";

export function TemplatesPage() {
  const { templates } = useWorkspace();

  return (
    <section className="page-grid">
      <div className="split-panel">
        <article className="panel-card emphasis">
          <div className="panel-heading">
            <p className="eyebrow">TEMPLATE EXTRACTION</p>
            <h4>显眼入口已经预留</h4>
          </div>
          <p className="panel-copy">
            后续这里将接“提取模板”主按钮、链接输入框和提取状态反馈。
          </p>
          <div className="action-row">
            <button className="primary-button" type="button">
              提取模板
            </button>
            <button className="ghost-button" type="button">
              新建模板
            </button>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">
            <p className="eyebrow">RULES</p>
            <h4>抽取判断预留规则</h4>
          </div>
          <ul className="feature-list">
            <li>页面是否存在稳定重复模块</li>
            <li>是否可抽象出通用结构和样式变量</li>
            <li>不适合抽取时要明确反馈失败原因</li>
          </ul>
        </article>
      </div>

      <div className="template-grid">
        {templates.map((item) => (
          <article key={item.id} className="template-card">
            <span className="template-tag">{item.kind === "builtin" ? "内置模板" : "风格变体"}</span>
            <h4>{item.name}</h4>
            <p>{item.summary}</p>
            <div className="template-meta">
              <span>{item.status}</span>
              <span>{item.useCases.join(" · ")}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
