import type { TemplateDefinition } from "../types";

const createdAt = "2026-04-17T10:00:00+08:00";

export const builtInTemplates: TemplateDefinition[] = [
  {
    id: "magazine-editorial",
    name: "专题杂志感",
    kind: "builtin",
    status: "active",
    summary: "大标题 + 明暗章节切换，适合观点专题和产业评论。",
    useCases: ["专题评论", "行业洞察", "叙事型长文"],
    supportsExtraction: true,
    theme: {
      primary: "#E8590C",
      primarySoft: "#FFF4EB",
      accent: "#1D1D1F",
      background: "#FAFAFA",
      textMain: "#1D1D1F",
    },
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "card-info-flow-lovart",
    name: "卡片信息流",
    kind: "builtin",
    status: "active",
    summary: "卡片封面 + 路线图 + 胶囊标签，适合教程和功能拆解。",
    useCases: ["工具教程", "产品更新", "步骤型内容"],
    supportsExtraction: true,
    theme: {
      primary: "#5D8960",
      primarySoft: "#EEF4EC",
      accent: "#F4DF72",
      background: "#FFFFFF",
      textMain: "#222222",
    },
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "controlled-variant",
    name: "受控随机变体",
    kind: "variant",
    status: "draft",
    summary: "基于固定组件做主题色和结构变体，避免风格单调和直接复刻。",
    useCases: ["样式衍生", "风格探索", "模板 A/B 对比"],
    supportsExtraction: false,
    theme: {
      primary: "#4B6D8F",
      primarySoft: "#EEF3F8",
      accent: "#D9BF6A",
      background: "#FAFBFC",
      textMain: "#1F2933",
    },
    createdAt,
    updatedAt: createdAt,
  },
];
