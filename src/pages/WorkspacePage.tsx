import { useMemo } from "react";
import { useWorkspace } from "../state/WorkspaceContext";
import type { MetricCard } from "../types";

export function WorkspacePage() {
  const { currentProject, templates, updateProjectMeta, updateProjectTags, resetWorkspace } =
    useWorkspace();

  const metrics: MetricCard[] = useMemo(
    () => [
      {
        label: "项目状态",
        value: currentProject ? "已接入存储" : "未加载",
        detail: "Step 2 / 统一数据结构 + localStorage",
      },
      {
        label: "可用模板",
        value: `${templates.length} 套`,
        detail: "内置模板数据已进入 store",
      },
      {
        label: "导入源",
        value: "6 类",
        detail: "URL / MD / TXT / HTML / DOC / DOCX",
      },
    ],
    [currentProject, templates.length],
  );

  if (!currentProject) {
    return null;
  }

  return (
    <section className="page-grid workspace-grid">
      <div className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">WORKSPACE</p>
          <h3>把“导入内容、结构化编辑、预览结果”三栏关系先固定下来</h3>
          <p>
            这是 Step 1 的骨架页面，用来承接后续的内容解析、AI 重组、模板切换和导出逻辑。
          </p>
        </div>

        <div className="hero-tags">
          <span>内容导入</span>
          <span>结构化编辑</span>
          <span>公众号预览</span>
        </div>
      </div>

      <div className="metric-row">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </article>
        ))}
      </div>

      <div className="columns-3">
        <article className="panel-card">
          <div className="panel-heading">
            <p className="eyebrow">LEFT</p>
            <h4>当前项目元信息</h4>
          </div>
          <div className="form-stack">
            <label className="field">
              <span>项目标题</span>
              <input
                value={currentProject.title}
                onChange={(event) => updateProjectMeta({ title: event.target.value })}
                type="text"
              />
            </label>
            <label className="field">
              <span>内容摘要</span>
              <textarea
                value={currentProject.summary}
                onChange={(event) => updateProjectMeta({ summary: event.target.value })}
                rows={5}
              />
            </label>
            <label className="field">
              <span>标签</span>
              <input
                value={currentProject.tags.join(" / ")}
                onChange={(event) =>
                  updateProjectTags(
                    event.target.value
                      .split("/")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                type="text"
              />
            </label>
            <button className="ghost-button" onClick={resetWorkspace} type="button">
              重置为示例数据
            </button>
          </div>
        </article>

        <article className="panel-card emphasis">
          <div className="panel-heading">
            <p className="eyebrow">CENTER</p>
            <h4>结构化章节数据</h4>
          </div>
          <div className="section-stack">
            {currentProject.sections.map((section, index) => (
              <article key={section.id} className="section-card">
                <span className="section-badge">{`0${index + 1}`}</span>
                <div>
                  <h5>{section.heading ?? "未命名章节"}</h5>
                  <p>{section.body}</p>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-heading">
            <p className="eyebrow">RIGHT</p>
            <h4>项目存储快照</h4>
          </div>
          <div className="snapshot-card">
            <p>
              <strong>当前模板：</strong>
              {currentProject.styleTemplateId}
            </p>
            <p>
              <strong>创建时间：</strong>
              {new Date(currentProject.createdAt).toLocaleString("zh-CN")}
            </p>
            <p>
              <strong>更新时间：</strong>
              {new Date(currentProject.updatedAt).toLocaleString("zh-CN")}
            </p>
            <p>
              <strong>平台变体：</strong>
              {currentProject.platformVariants
                .map((item) => `${item.platform}/${item.format}`)
                .join("、")}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
