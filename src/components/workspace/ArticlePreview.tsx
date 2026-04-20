import type { CSSProperties } from "react";
import type { ArticleProject, ArticleSection, TemplateDefinition } from "../../types";

type ArticlePreviewProps = {
  project: ArticleProject;
  template: TemplateDefinition | undefined;
};

function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function takeSections(project: ArticleProject, count = 4) {
  return project.sections.slice(0, count);
}

function renderParagraphs(section: ArticleSection) {
  return splitParagraphs(section.body).map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

function renderPoints(section: ArticleSection) {
  if (!section.points || section.points.length === 0) {
    return null;
  }

  return (
    <ul className="preview-points">
      {section.points.map((point) => (
        <li key={point}>{point}</li>
      ))}
    </ul>
  );
}

function renderEditorialPreview(project: ArticleProject) {
  return (
    <div className="preview-layout preview-layout-editorial">
      {project.sections.map((section, index) => (
        <section key={section.id} className={`preview-section preview-section-${section.type}`}>
          <div className="preview-editorial-header">
            <span className="preview-editorial-index">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="preview-section-type">{section.type.toUpperCase()}</p>
              <h4>{section.heading?.trim() || "未命名章节"}</h4>
            </div>
          </div>
          <div className="preview-body">{renderParagraphs(section)}</div>
          {renderPoints(section)}
        </section>
      ))}
    </div>
  );
}

function renderCardPreview(project: ArticleProject) {
  const roadmap = takeSections(project);

  return (
    <div className="preview-layout preview-layout-cards">
      <section className="preview-roadmap">
        <p className="preview-roadmap-title">CONTENT ROADMAP</p>
        <div className="preview-roadmap-grid">
          {roadmap.map((section, index) => (
            <article key={section.id} className="preview-roadmap-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{section.heading?.trim() || `步骤 ${index + 1}`}</strong>
            </article>
          ))}
        </div>
      </section>

      <div className="preview-card-grid">
        {project.sections.map((section) => (
          <section key={section.id} className={`preview-card-block preview-section-${section.type}`}>
            <p className="preview-section-type">{section.type.toUpperCase()}</p>
            <h4>{section.heading?.trim() || "未命名章节"}</h4>
            <div className="preview-body">{renderParagraphs(section)}</div>
            {renderPoints(section)}
          </section>
        ))}
      </div>
    </div>
  );
}

function renderSpotlightPreview(project: ArticleProject) {
  const keyMetrics = takeSections(project, 3);

  return (
    <div className="preview-layout preview-layout-spotlight">
      <section className="preview-spotlight-metrics">
        {keyMetrics.map((section, index) => (
          <article key={section.id} className="preview-spotlight-metric">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{section.heading?.trim() || "核心节点"}</strong>
            <p>{splitParagraphs(section.body)[0] ?? "待补充摘要"}</p>
          </article>
        ))}
      </section>

      <div className="preview-spotlight-list">
        {project.sections.map((section, index) => (
          <section key={section.id} className={`preview-spotlight-item preview-section-${section.type}`}>
            <div className="preview-spotlight-line" />
            <div className="preview-spotlight-content">
              <p className="preview-section-type">NODE {String(index + 1).padStart(2, "0")}</p>
              <h4>{section.heading?.trim() || "未命名章节"}</h4>
              <div className="preview-body">{renderParagraphs(section)}</div>
              {renderPoints(section)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function renderLayout(project: ArticleProject, template: TemplateDefinition | undefined) {
  switch (template?.layout) {
    case "cards":
      return renderCardPreview(project);
    case "spotlight":
      return renderSpotlightPreview(project);
    case "editorial":
    default:
      return renderEditorialPreview(project);
  }
}

export function ArticlePreview({ project, template }: ArticlePreviewProps) {
  const style = {
    "--preview-primary": template?.theme.primary ?? "#5D8960",
    "--preview-primary-soft": template?.theme.primarySoft ?? "#EEF4EC",
    "--preview-accent": template?.theme.accent ?? "#F4DF72",
    "--preview-background": template?.theme.background ?? "#FFFFFF",
    "--preview-text": template?.theme.textMain ?? "#1D1D1F",
  } as CSSProperties;

  return (
    <div className="preview-surface" style={style}>
      <div className="preview-hero">
        <p className="preview-kicker">WECHAT ARTICLE PREVIEW</p>
        <h3>{project.title}</h3>
        <p className="preview-summary">{project.summary}</p>
        <div className="preview-tags">
          {project.tags.length > 0 ? (
            project.tags.map((tag) => <span key={tag}>{tag}</span>)
          ) : (
            <span>待补充标签</span>
          )}
        </div>
      </div>

      <div className="preview-meta-row">
        <div>
          <strong>模板</strong>
          <span>{template?.name ?? project.styleTemplateId}</span>
        </div>
        <div>
          <strong>布局</strong>
          <span>{template?.layout ?? "editorial"}</span>
        </div>
        <div>
          <strong>章节</strong>
          <span>{project.sections.length} 个</span>
        </div>
      </div>

      {project.sections.length > 0 ? (
        renderLayout(project, template)
      ) : (
        <div className="preview-empty">
          当前项目还没有章节内容。你可以先导入文章，或者手动新增一个章节开始编辑。
        </div>
      )}
    </div>
  );
}
