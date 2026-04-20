import { useMemo, useState } from "react";
import { ArticlePreview } from "../components/workspace/ArticlePreview";
import { useWorkspace } from "../state/WorkspaceContext";

export function TemplatesPage() {
  const {
    templates,
    currentProject,
    updateProjectTemplate,
    updateTemplateStatus,
    duplicateTemplate,
  } = useWorkspace();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? "");

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );

  const activeCount = templates.filter((item) => item.status === "active").length;

  return (
    <section className="page-grid">
      <div className="split-panel">
        <article className="panel-card emphasis">
          <div className="panel-heading">
            <p className="eyebrow">TEMPLATE SYSTEM</p>
            <h4>模板系统已经进入可切换布局阶段</h4>
          </div>
          <p className="panel-copy">
            当前不再只是切换主题色。不同模板会驱动不同的预览结构，方便后续继续沉淀模板组件和导出渲染链路。
          </p>
          <div className="template-summary-grid">
            <div>
              <strong>{templates.length}</strong>
              <span>模板总数</span>
            </div>
            <div>
              <strong>{activeCount}</strong>
              <span>启用模板</span>
            </div>
            <div>
              <strong>{currentProject ? "已接线" : "未加载"}</strong>
              <span>工作台联动</span>
            </div>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">
            <p className="eyebrow">RULES</p>
            <h4>当前模板管理范围</h4>
          </div>
          <ul className="feature-list">
            <li>可查看模板布局类型、组件清单与适用场景。</li>
            <li>可直接将模板套用到当前项目，实时查看预览结构变化。</li>
            <li>支持复制模板和启用/停用模板，便于后续做模板变体。</li>
            <li>模板提取入口仍保留在下一阶段继续完善。</li>
          </ul>
        </article>
      </div>

      <div className="templates-layout">
        <div className="template-grid">
          {templates.map((item) => (
            <article
              key={item.id}
              className={item.id === selectedTemplate?.id ? "template-card selected" : "template-card"}
            >
              <div className="template-card-top">
                <span className="template-tag">{item.kind === "builtin" ? "内置模板" : "风格变体"}</span>
                <button className="ghost-button mini-button" onClick={() => setSelectedTemplateId(item.id)} type="button">
                  查看
                </button>
              </div>
              <h4>{item.name}</h4>
              <p>{item.summary}</p>
              <div className="template-meta">
                <span>布局：{item.layout}</span>
                <span>状态：{item.status}</span>
                <span>{item.useCases.join(" · ")}</span>
              </div>
            </article>
          ))}
        </div>

        {selectedTemplate ? (
          <article className="panel-card template-detail-card">
            <div className="panel-heading">
              <p className="eyebrow">TEMPLATE DETAIL</p>
              <h4>{selectedTemplate.name}</h4>
            </div>
            <p className="panel-copy">{selectedTemplate.summary}</p>

            <div className="template-detail-grid">
              <div>
                <strong>布局类型</strong>
                <span>{selectedTemplate.layout}</span>
              </div>
              <div>
                <strong>模板状态</strong>
                <span>{selectedTemplate.status}</span>
              </div>
              <div>
                <strong>适用场景</strong>
                <span>{selectedTemplate.useCases.join("、")}</span>
              </div>
              <div>
                <strong>支持提取</strong>
                <span>{selectedTemplate.supportsExtraction ? "是" : "否"}</span>
              </div>
            </div>

            <div className="template-components">
              {selectedTemplate.components.map((component) => (
                <span key={component}>{component}</span>
              ))}
            </div>

            <div className="action-row">
              <button
                className="primary-button"
                onClick={() => updateProjectTemplate(selectedTemplate.id)}
                type="button"
              >
                套用到当前项目
              </button>
              <button className="ghost-button" onClick={() => duplicateTemplate(selectedTemplate.id)} type="button">
                复制模板
              </button>
              <button
                className="ghost-button"
                onClick={() =>
                  updateTemplateStatus(
                    selectedTemplate.id,
                    selectedTemplate.status === "active" ? "disabled" : "active",
                  )
                }
                type="button"
              >
                {selectedTemplate.status === "active" ? "停用模板" : "启用模板"}
              </button>
            </div>

            {currentProject ? (
              <div className="template-preview-wrap">
                <ArticlePreview project={currentProject} template={selectedTemplate} />
              </div>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  );
}
