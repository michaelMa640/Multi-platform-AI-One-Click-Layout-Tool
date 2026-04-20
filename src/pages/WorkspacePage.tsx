import { useMemo, useState } from "react";
import { importArticle } from "../importers/articleImporter";
import { useWorkspace } from "../state/WorkspaceContext";
import type { ImportStatus, MetricCard, SourceType } from "../types";

const textImportOptions: Array<{ label: string; value: Extract<SourceType, "markdown" | "txt" | "html"> }> = [
  { label: "Markdown", value: "markdown" },
  { label: "纯文本", value: "txt" },
  { label: "HTML", value: "html" },
];

export function WorkspacePage() {
  const {
    currentProject,
    projects,
    templates,
    importProject,
    selectProject,
    updateProjectMeta,
    updateProjectTags,
    resetWorkspace,
  } = useWorkspace();
  const [textSourceType, setTextSourceType] = useState<Extract<SourceType, "markdown" | "txt" | "html">>("markdown");
  const [rawInput, setRawInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importMessage, setImportMessage] = useState("准备好导入原始内容。");
  const [isImporting, setIsImporting] = useState(false);

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
        detail: "URL / MD / TXT / HTML / DOCX / DOC",
      },
    ],
    [currentProject, templates.length],
  );

  if (!currentProject) {
    return null;
  }

  const runTextImport = async () => {
    setIsImporting(true);
    setImportStatus("idle");

    try {
      const project = await importArticle({
        kind: "text",
        sourceType: textSourceType,
        value: rawInput,
      });

      importProject(project);
      setImportStatus("success");
      setImportMessage(`已从${textSourceType.toUpperCase()}内容生成新项目。`);
      setRawInput("");
    } catch (error) {
      setImportStatus("error");
      setImportMessage(error instanceof Error ? error.message : "文本导入失败。");
    } finally {
      setIsImporting(false);
    }
  };

  const runUrlImport = async () => {
    setIsImporting(true);
    setImportStatus("idle");

    try {
      const project = await importArticle({
        kind: "url",
        value: urlInput,
      });

      importProject(project);
      setImportStatus("success");
      setImportMessage("URL 导入成功，已创建新项目。");
      setUrlInput("");
    } catch (error) {
      setImportStatus("error");
      setImportMessage(
        error instanceof Error
          ? error.message
          : "URL 导入失败，可能是目标站点不可直连或被浏览器拦截。",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const onFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImporting(true);
    setImportStatus("idle");

    try {
      const project = await importArticle({
        kind: "file",
        file,
      });

      importProject(project);
      setImportStatus("success");
      setImportMessage(`文件导入成功：${file.name}`);
    } catch (error) {
      setImportStatus("error");
      setImportMessage(error instanceof Error ? error.message : "文件导入失败。");
    } finally {
      event.target.value = "";
      setIsImporting(false);
    }
  };

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
            <h4>导入与项目控制区</h4>
          </div>
          <div className="form-stack">
            <div className="control-block">
              <strong className="block-title">当前项目</strong>
              <div className="project-list">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    className={project.id === currentProject.id ? "project-chip active" : "project-chip"}
                    onClick={() => selectProject(project.id)}
                    type="button"
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-block">
              <strong className="block-title">URL 导入</strong>
              <label className="field">
                <span>文章链接</span>
                <input
                  value={urlInput}
                  onChange={(event) => setUrlInput(event.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </label>
              <button className="primary-button" disabled={isImporting} onClick={runUrlImport} type="button">
                {isImporting ? "导入中..." : "导入 URL"}
              </button>
            </div>

            <div className="control-block">
              <strong className="block-title">文本导入</strong>
              <div className="inline-options">
                {textImportOptions.map((option) => (
                  <button
                    key={option.value}
                    className={option.value === textSourceType ? "option-chip active" : "option-chip"}
                    onClick={() => setTextSourceType(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <label className="field">
                <span>原始内容</span>
                <textarea
                  value={rawInput}
                  onChange={(event) => setRawInput(event.target.value)}
                  placeholder="粘贴 Markdown、TXT 或 HTML 原文"
                  rows={8}
                />
              </label>
              <button className="primary-button" disabled={isImporting} onClick={runTextImport} type="button">
                {isImporting ? "导入中..." : "导入文本"}
              </button>
            </div>

            <div className="control-block">
              <strong className="block-title">文件导入</strong>
              <label className="upload-field">
                <span>支持 MD / TXT / HTML / DOCX</span>
                <input accept=".md,.markdown,.txt,.html,.htm,.docx,.doc" onChange={onFileImport} type="file" />
              </label>
            </div>

            <div className={importStatus === "error" ? "status-box error" : importStatus === "success" ? "status-box success" : "status-box"}>
              {importMessage}
            </div>

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
              <strong>导入来源：</strong>
              {currentProject.sourceName ?? currentProject.sourceUrl ?? currentProject.sourceType}
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
