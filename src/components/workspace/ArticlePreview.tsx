import type { CSSProperties } from "react";
import type { ArticleProject, TemplateDefinition } from "../../types";

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
          <strong>来源</strong>
          <span>{project.sourceName ?? project.sourceUrl ?? project.sourceType}</span>
        </div>
        <div>
          <strong>章节</strong>
          <span>{project.sections.length} 个</span>
        </div>
      </div>

      <div className="preview-section-list">
        {project.sections.length > 0 ? (
          project.sections.map((section, index) => (
            <section key={section.id} className={`preview-section preview-section-${section.type}`}>
              <div className="preview-section-header">
                <span className="preview-section-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="preview-section-type">{section.type.toUpperCase()}</p>
                  <h4>{section.heading?.trim() || "未命名章节"}</h4>
                </div>
              </div>

              <div className="preview-body">
                {splitParagraphs(section.body).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {section.points && section.points.length > 0 ? (
                <ul className="preview-points">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))
        ) : (
          <div className="preview-empty">
            当前项目还没有章节内容。你可以先导入文章，或者手动新增一个章节开始编辑。
          </div>
        )}
      </div>
    </div>
  );
}
