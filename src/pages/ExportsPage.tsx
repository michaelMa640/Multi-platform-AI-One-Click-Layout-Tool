import { useWorkspace } from "../state/WorkspaceContext";

const exportOptions = [
  "微信公众号兼容 HTML",
  "Markdown 备份",
  "预览 DOM 截图导出",
];

export function ExportsPage() {
  const { currentProject } = useWorkspace();

  return (
    <section className="page-grid">
      <div className="split-panel">
        <article className="panel-card">
          <div className="panel-heading">
            <p className="eyebrow">OUTPUTS</p>
            <h4>导出目标</h4>
          </div>
          <ul className="feature-list">
            {exportOptions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel-card emphasis">
          <div className="panel-heading">
            <p className="eyebrow">MULTI-PLATFORM READY</p>
            <h4>统一渲染链路</h4>
          </div>
          <p className="panel-copy">
            先用 HTML/CSS 做预览和排版，再按目标平台输出 HTML 或图片，这是后续扩多平台最稳的底层。
          </p>
          <div className="export-meta">
            <strong>当前项目预留变体</strong>
            <span>
              {currentProject?.platformVariants
                .map((item) => `${item.platform}/${item.status}`)
                .join("、") ?? "暂无"}
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}
