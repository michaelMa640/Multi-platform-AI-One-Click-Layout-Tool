import type { ArticleSection, SectionType } from "../../types";

const sectionTypeLabels: Array<{ value: SectionType; label: string }> = [
  { value: "intro", label: "导语" },
  { value: "content", label: "正文" },
  { value: "quote", label: "引用" },
  { value: "highlight", label: "高亮" },
  { value: "conclusion", label: "结尾" },
];

type SectionEditorCardProps = {
  section: ArticleSection;
  index: number;
  total: number;
  onChange: (
    patch: Partial<Pick<ArticleSection, "type" | "heading" | "body" | "points">>,
  ) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
};

export function SectionEditorCard({
  section,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: SectionEditorCardProps) {
  return (
    <article className="editor-card">
      <div className="editor-card-header">
        <div>
          <p className="editor-index">{`SECTION ${String(index + 1).padStart(2, "0")}`}</p>
          <h5>{section.heading?.trim() || "未命名章节"}</h5>
        </div>
        <div className="editor-actions">
          <button
            className="ghost-button editor-action-button"
            disabled={index === 0}
            onClick={() => onMove("up")}
            type="button"
          >
            上移
          </button>
          <button
            className="ghost-button editor-action-button"
            disabled={index === total - 1}
            onClick={() => onMove("down")}
            type="button"
          >
            下移
          </button>
          <button className="ghost-button editor-action-button danger" onClick={onRemove} type="button">
            删除
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <label className="field">
          <span>章节类型</span>
          <select
            value={section.type}
            onChange={(event) => onChange({ type: event.target.value as SectionType })}
          >
            {sectionTypeLabels.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>章节标题</span>
          <input
            type="text"
            value={section.heading ?? ""}
            onChange={(event) => onChange({ heading: event.target.value })}
          />
        </label>
      </div>

      <label className="field">
        <span>正文内容</span>
        <textarea
          rows={6}
          value={section.body}
          onChange={(event) => onChange({ body: event.target.value })}
        />
      </label>

      <label className="field">
        <span>要点列表</span>
        <textarea
          rows={4}
          value={(section.points ?? []).join("\n")}
          onChange={(event) =>
            onChange({
              points: event.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
          placeholder="每行一个要点，预览区会自动转成列表"
        />
      </label>
    </article>
  );
}
