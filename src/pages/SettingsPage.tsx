import { useState } from "react";
import { defaultAISettings, loadAISettings, resetAISettings, saveAISettings } from "../lib/aiSettingsStorage";
import { useWorkspace } from "../state/WorkspaceContext";
import type { AIProvider, AISettings } from "../types";

export function SettingsPage() {
  const { hydrated, lastSavedAt } = useWorkspace();
  const [settings, setSettings] = useState<AISettings>(() => loadAISettings());
  const [statusMessage, setStatusMessage] = useState("当前设置保存在本机浏览器存储中，适合先在这台 mac 上跑通。");

  const updateSetting = <Key extends keyof AISettings>(key: Key, value: AISettings[Key]) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    saveAISettings(settings);
    setStatusMessage("模型设置已保存。返回工作台后可以直接执行 AI 重组。");
  };

  const restoreDefaults = () => {
    resetAISettings();
    setSettings(defaultAISettings);
    setStatusMessage("已恢复默认设置。当前默认 provider 为 Mock，可直接本机演示。");
  };

  return (
    <section className="page-grid">
      <div className="split-panel">
        <article className="panel-card">
          <div className="panel-heading">
            <p className="eyebrow">MODEL SETTINGS</p>
            <h4>AI 重组配置</h4>
          </div>

          <div className="form-stack">
            <label className="field">
              <span>Provider</span>
              <select
                value={settings.provider}
                onChange={(event) => updateSetting("provider", event.target.value as AIProvider)}
              >
                <option value="mock">Mock（本机演示）</option>
                <option value="openai-compatible">OpenAI-compatible</option>
              </select>
            </label>

            <label className="field">
              <span>模型名</span>
              <input
                type="text"
                value={settings.model}
                onChange={(event) => updateSetting("model", event.target.value)}
                placeholder="例如 gpt-4.1-mini"
              />
            </label>

            <label className="field">
              <span>Base URL</span>
              <input
                type="url"
                value={settings.baseUrl}
                onChange={(event) => updateSetting("baseUrl", event.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </label>

            <label className="field">
              <span>API Key</span>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(event) => updateSetting("apiKey", event.target.value)}
                placeholder="sk-..."
              />
            </label>

            <label className="field">
              <span>Temperature</span>
              <input
                type="number"
                min="0"
                max="1.5"
                step="0.1"
                value={settings.temperature}
                onChange={(event) => updateSetting("temperature", Number(event.target.value) || 0)}
              />
            </label>

            <label className="field">
              <span>系统提示词</span>
              <textarea
                rows={5}
                value={settings.systemPrompt}
                onChange={(event) => updateSetting("systemPrompt", event.target.value)}
              />
            </label>

            <div className="action-row">
              <button className="primary-button" onClick={saveSettings} type="button">
                保存模型设置
              </button>
              <button className="ghost-button" onClick={restoreDefaults} type="button">
                恢复默认
              </button>
            </div>

            <div className="status-box">{statusMessage}</div>
          </div>
        </article>

        <article className="panel-card emphasis">
          <div className="panel-heading">
            <p className="eyebrow">CURRENT MODE</p>
            <h4>先优先跑通当前这台 mac</h4>
          </div>
          <ul className="feature-list">
            <li>默认使用 Mock provider，不依赖外部接口就能演示 Step 5 主链路。</li>
            <li>如果切换到 OpenAI-compatible，工作台会直接用你保存的模型配置发起重组。</li>
            <li>当前阶段 API Key 保存在本机浏览器存储，只适合开发期本机验证。</li>
            <li>后续转入正式 Tauri 运行时时，建议把密钥调用迁到 Rust 侧，避免前端直出。</li>
          </ul>

          <div className="setting-list compact">
            <div className="setting-row">
              <span>当前 provider</span>
              <span className="setting-value">{settings.provider}</span>
            </div>
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
      </div>
    </section>
  );
}
