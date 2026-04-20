import { useWorkspace } from "../state/WorkspaceContext";

const settings = [
  "模型配置",
  "默认模板",
  "导出偏好",
  "本地缓存目录",
];

export function SettingsPage() {
  const { hydrated, lastSavedAt } = useWorkspace();

  return (
    <section className="page-grid">
      <article className="panel-card">
        <div className="panel-heading">
          <p className="eyebrow">SETTINGS</p>
          <h4>系统设置占位页</h4>
        </div>
        <div className="setting-list">
          {settings.map((item) => (
            <div key={item} className="setting-row">
              <span>{item}</span>
              <span className="setting-value">待接入</span>
            </div>
          ))}
          <div className="setting-row">
            <span>工作区水合状态</span>
            <span className="setting-value">{hydrated ? "已完成" : "未完成"}</span>
          </div>
          <div className="setting-row">
            <span>最后保存时间</span>
            <span className="setting-value">
              {lastSavedAt ? new Date(lastSavedAt).toLocaleString("zh-CN") : "尚未保存"}
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}
