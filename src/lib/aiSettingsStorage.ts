import type { AISettings } from "../types";

const STORAGE_KEY = "wechat-layout-tool/ai-settings";

export const defaultAISettings: AISettings = {
  provider: "mock",
  model: "gpt-4.1-mini",
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  temperature: 0.7,
  systemPrompt:
    "你是微信公众号资深编辑。请把输入内容重组为适合公众号发布的结构化稿件，保持信息准确、结构清晰、可读性强。",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadAISettings(): AISettings {
  if (!canUseStorage()) {
    return defaultAISettings;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultAISettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AISettings>;

    return {
      ...defaultAISettings,
      ...parsed,
      temperature:
        typeof parsed.temperature === "number"
          ? Math.min(1.5, Math.max(0, parsed.temperature))
          : defaultAISettings.temperature,
    };
  } catch {
    return defaultAISettings;
  }
}

export function saveAISettings(settings: AISettings) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetAISettings() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
