import { useEffect, useMemo, useState } from "react";
import { buildProjectExportBundle } from "../exporters/exportProject";
import { useWorkspace } from "../state/WorkspaceContext";

type ExportFormat = "html" | "markdown" | "snapshot";

const exportCards: Array<{
  format: ExportFormat;
  title: string;
  description: string;
  extension: string;
}> = [
  {
    format: "html",
    title: "微信公众号兼容 HTML",
    description: "导出带内联样式的文章结构，适合作为公众号排版和后续渲染基底。",
    extension: ".html",
  },
  {
    format: "markdown",
    title: "Markdown 备份",
    description: "导出结构化 Markdown，方便归档、版本追踪或继续二次加工。",
    extension: ".md",
  },
  {
    format: "snapshot",
    title: "项目快照 JSON",
    description: "完整保留项目数据、章节和审查结果，方便回档或后续迁移。",
    extension: ".json",
  },
];

function copyText(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("当前环境不支持剪贴板复制。");
  }

  return navigator.clipboard.writeText(text);
}

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function ExportsPage() {
  const { currentProject, updatePlatformVariantStatus } = useWorkspace();
  const [activeFormat, setActiveFormat] = useState<ExportFormat>("html");
  const [statusMessage, setStatusMessage] = useState("准备好导出当前项目。");

  const exportBundle = useMemo(
    () => (currentProject ? buildProjectExportBundle(currentProject) : null),
    [currentProject],
  );

  useEffect(() => {
    if (!currentProject) {
      return;
    }

    setStatusMessage("准备好导出当前项目。");
  }, [currentProject?.id]);

  if (!currentProject || !exportBundle) {
    return null;
  }

  const activeCard = exportCards.find((card) => card.format === activeFormat) ?? exportCards[0];
  const exportContent =
    activeFormat === "html"
      ? exportBundle.html
      : activeFormat === "markdown"
        ? exportBundle.markdown
        : exportBundle.snapshot;

  const handleCopy = async () => {
    try {
      await copyText(exportContent);
      setStatusMessage(`${activeCard.title} 已复制到剪贴板。`);

      if (activeFormat === "html") {
        updatePlatformVariantStatus("wechat", "html", "generated");
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "复制失败。");
    }
  };

  const handleDownload = () => {
    const fileName = `${exportBundle.fileBaseName}${activeCard.extension}`;
    const mimeType =
      activeFormat === "html"
        ? "text/html;charset=utf-8"
        : activeFormat === "markdown"
          ? "text/markdown;charset=utf-8"
          : "application/json;charset=utf-8";

    downloadTextFile(fileName, exportContent, mimeType);
    setStatusMessage(`${fileName} 已开始下载。`);

    if (activeFormat === "html") {
      updatePlatformVariantStatus("wechat", "html", "generated");
    }
  };

  return (
    <section className="page-grid">
      <div className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">EXPORTS</p>
          <h3>把当前稿件导成可以真正带走的产物，收住 V1 的主链路</h3>
          <p>
            现在导出中心会基于当前项目生成微信兼容 HTML、Markdown 备份和项目快照。这样你在这台 mac 上就能先跑通“编辑、审查、导出”的闭环。
          </p>
        </div>

        <div className="review-hero-actions">
          <div className="review-status-pill">
            <strong>当前项目</strong>
            <span>{currentProject.title}</span>
          </div>
          <div className="review-status-pill">
            <strong>最近状态</strong>
            <span>
              {currentProject.platformVariants
                .map((item) => `${item.platform}/${item.format}/${item.status}`)
                .join("、")}
            </span>
          </div>
        </div>
      </div>

      <div className="split-panel exports-layout">
        <article className="panel-card">
          <div className="panel-heading">
            <p className="eyebrow">OUTPUTS</p>
            <h4>导出目标与操作</h4>
          </div>
          <div className="form-stack">
            <div className="inline-options">
              {exportCards.map((card) => (
                <button
                  key={card.format}
                  className={card.format === activeFormat ? "option-chip active" : "option-chip"}
                  onClick={() => setActiveFormat(card.format)}
                  type="button"
                >
                  {card.title}
                </button>
              ))}
            </div>

            <div className="control-block">
              <strong className="block-title">{activeCard.title}</strong>
              <p className="inline-note">{activeCard.description}</p>
              <div className="action-row">
                <button className="primary-button" onClick={handleDownload} type="button">
                  下载当前导出
                </button>
                <button className="ghost-button" onClick={handleCopy} type="button">
                  复制到剪贴板
                </button>
              </div>
            </div>

            <div className="status-box success">{statusMessage}</div>
          </div>
        </article>

        <article className="panel-card export-preview-card">
          <div className="panel-heading">
            <p className="eyebrow">PREVIEW</p>
            <h4>当前导出内容预览</h4>
          </div>
          <label className="field">
            <span>{activeCard.title}</span>
            <textarea
              className="export-output"
              readOnly
              rows={18}
              value={exportContent}
            />
          </label>
        </article>
      </div>

      <div className="split-panel exports-layout">
        <article className="panel-card emphasis">
          <div className="panel-heading">
            <p className="eyebrow">MULTI-PLATFORM READY</p>
            <h4>统一渲染链路</h4>
          </div>
          <p className="panel-copy">
            当前先把微信 HTML、Markdown 和项目快照跑通，后续再继续接图片导出或更多平台格式时，可以复用同一套结构化内容和模板数据。
          </p>
          <ul className="feature-list">
            <li>HTML 导出会直接复用当前项目标题、摘要、标签、章节和模板主题。</li>
            <li>Markdown 作为轻量备份，适合版本留档和快速回看。</li>
            <li>JSON 快照保留完整结构化数据，后续迁移到 Tauri 本地文件存储也更顺手。</li>
          </ul>
        </article>

        <article className="panel-card">
          <div className="panel-heading">
            <p className="eyebrow">DELIVERY CHECK</p>
            <h4>导出前建议再过一遍</h4>
          </div>
          <div className="export-meta">
            <strong>当前项目预留变体</strong>
            <span>{currentProject.platformVariants.map((item) => `${item.platform}/${item.status}`).join("、")}</span>
          </div>
          <ul className="feature-list">
            <li>先到文章审查页看一遍高优先级问题是否已清掉。</li>
            <li>确认模板风格和文章类型匹配，再导出 HTML。</li>
            <li>下载一份 JSON 快照，避免后续调样式时丢失当前版本。</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
