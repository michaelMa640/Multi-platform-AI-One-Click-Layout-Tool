import { useMemo, useState } from "react";
import { ArticlePreview } from "../components/workspace/ArticlePreview";
import { extractTemplateFromUrl } from "../templates/extractTemplate";
import { useWorkspace } from "../state/WorkspaceContext";
import type { ImportStatus } from "../types";

export function TemplatesPage() {
  const {
    templates,
    currentProject,
    addTemplate,
    updateProjectTemplate,
    updateTemplateStatus,
    duplicateTemplate,
  } = useWorkspace();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [extractUrl, setExtractUrl] = useState("");
  const [extractStatus, setExtractStatus] = useState<ImportStatus>("idle");
  const [extractMessage, setExtractMessage] = useState("输入一个页面链接后，系统会判断是否适合抽取为模板。");
  const [isExtracting, setIsExtracting] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );

  const activeCount = templates.filter((item) => item.status === "active").length;

  const runExtraction = async () => {
    setIsExtracting(true);
    setExtractStatus("idle");
    setExtractMessage("正在分析链接结构，判断是否适合抽取为模板...");

    try {
      const result = await extractTemplateFromUrl(extractUrl);

      if (!result.ok) {
        setExtractStatus("error");
        setExtractMessage(result.reason);
        return;
      }

      addTemplate(result.template);
      setSelectedTemplateId(result.template.id);
      setExtractStatus("success");
      setExtractMessage(`${result.reason} 已生成模板草稿：${result.template.name}`);
      setExtractUrl("");
    } catch (error) {
      setExtractStatus("error");
      setExtractMessage(error instanceof Error ? error.message : "模板提取失败。");
    } finally {
      setIsExtracting(false);
    }
  };

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
            <p className="eyebrow">TEMPLATE EXTRACTION</p>
            <h4>链接模板提取入口</h4>
          </div>
          <div className="form-stack">
            <label className="field">
              <span>页面链接</span>
              <input
                type="url"
                value={extractUrl}
                onChange={(event) => setExtractUrl(event.target.value)}
                placeholder="https://..."
              />
            </label>
            <button className="primary-button" disabled={isExtracting} onClick={runExtraction} type="button">
              {isExtracting ? "提取中..." : "提取模板"}
            </button>
            <div
              className={
                extractStatus === "error"
                  ? "status-box error"
                  : extractStatus === "success"
                    ? "status-box success"
                    : "status-box"
              }
            >
              {extractMessage}
            </div>
            <ul className="feature-list">
              <li>当前先用启发式规则判断页面结构是否稳定。</li>
              <li>可提取时会生成模板草稿，并自动加入模板列表。</li>
              <li>不适合提取时会明确说明失败原因，不做静默失败。</li>
              <li>某些页面可能受浏览器跨域限制，后续可迁移到 Tauri / Rust 侧抓取。</li>
            </ul>
          </div>
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
