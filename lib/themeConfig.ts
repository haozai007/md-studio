import { FontFamily, FontWeight } from "./fonts";

export type ThemeName = "supo-minimal" | "ai-project" | "design-case" | "light-note-blue";
export type H2Style = "left-border" | "tag-label" | "numbered" | "divider" | "plain" | "soft-underline";
export type BoldStyle = "bold-only" | "primary-color" | "highlight" | "underline";
export type IntroStyle = "card" | "editorial" | "minimal";
export type TocStyle = "numbered" | "compact";
export type CodeStyle = "dark" | "light";

export interface ThemeRecipe {
  description: string;
  introStyle: IntroStyle;
  tocStyle: TocStyle;
  codeStyle: CodeStyle;
  underlineWidth: number;
}

export interface StyleSettings {
  theme: ThemeName;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  lineHeight: number;
  headingFontSize: number;
  borderRadius: number;
  contentWidth: number;
  h2Style: H2Style;
  boldStyle: BoldStyle;
  paragraphSpacing: number;
  sectionSpacing: number;
  listIndent: number;
  listItemSpacing: number;
  fontFamily: FontFamily;
  letterSpacing: number;
  fontWeight: FontWeight;
}

export interface ThemePreset {
  name: ThemeName;
  label: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  lineHeight: number;
  headingFontSize: number;
  borderRadius: number;
  contentWidth: number;
  h2Style: H2Style;
  boldStyle: BoldStyle;
  paragraphSpacing: number;
  sectionSpacing: number;
  listIndent: number;
  listItemSpacing: number;
  fontFamily: FontFamily;
  letterSpacing: number;
  fontWeight: FontWeight;
  recipe: ThemeRecipe;
}

export const themePresets: Record<ThemeName, ThemePreset> = {
  "supo-minimal": {
    name: "supo-minimal",
    label: "苏坡极简",
    primaryColor: "#A8FF2F",
    backgroundColor: "#FBFBF9",
    textColor: "#1F1F1F",
    fontSize: 15,
    lineHeight: 1.8,
    headingFontSize: 22,
    borderRadius: 4,
    contentWidth: 600,
    h2Style: "left-border",
    boldStyle: "bold-only",
    paragraphSpacing: 0.8,
    sectionSpacing: 1.8,
    listIndent: 1.2,
    listItemSpacing: 0.3,
    fontFamily: "optima-light",
    letterSpacing: 0.5,
    fontWeight: "300",
    recipe: {
      description: "适合清单、工具盘点和高信息密度教程",
      introStyle: "card",
      tocStyle: "numbered",
      codeStyle: "dark",
      underlineWidth: 2,
    },
  },
  "ai-project": {
    name: "ai-project",
    label: "AI项目风",
    primaryColor: "#6C5CE7",
    backgroundColor: "#FAFAFE",
    textColor: "#1A1A2E",
    fontSize: 16,
    lineHeight: 1.75,
    headingFontSize: 24,
    borderRadius: 8,
    contentWidth: 620,
    h2Style: "numbered",
    boldStyle: "primary-color",
    paragraphSpacing: 0.8,
    sectionSpacing: 2.0,
    listIndent: 1.2,
    listItemSpacing: 0.3,
    fontFamily: "optima-light",
    letterSpacing: 0.3,
    fontWeight: "400",
    recipe: {
      description: "适合技术教程、项目实战和数据型内容",
      introStyle: "card",
      tocStyle: "numbered",
      codeStyle: "dark",
      underlineWidth: 2,
    },
  },
  "light-note-blue": {
    name: "light-note-blue",
    label: "轻笔记蓝",
    primaryColor: "#4BA3C7",
    backgroundColor: "#FBFCFA",
    textColor: "#3F3F3F",
    fontSize: 15,
    lineHeight: 1.8,
    headingFontSize: 22,
    borderRadius: 6,
    contentWidth: 600,
    h2Style: "soft-underline",
    boldStyle: "primary-color",
    paragraphSpacing: 0.75,
    sectionSpacing: 1.9,
    listIndent: 1.2,
    listItemSpacing: 0.25,
    fontFamily: "optima-light",
    letterSpacing: 0.4,
    fontWeight: "300",
    recipe: {
      description: "适合随笔、故事和轻量知识笔记",
      introStyle: "minimal",
      tocStyle: "compact",
      codeStyle: "light",
      underlineWidth: 1.5,
    },
  },
  "design-case": {
    name: "design-case",
    label: "设计案例风",
    primaryColor: "#FF6B6B",
    backgroundColor: "#FFFBF5",
    textColor: "#2D2D2D",
    fontSize: 16,
    lineHeight: 1.9,
    headingFontSize: 26,
    borderRadius: 12,
    contentWidth: 640,
    h2Style: "divider",
    boldStyle: "bold-only",
    paragraphSpacing: 0.9,
    sectionSpacing: 2.2,
    listIndent: 1.4,
    listItemSpacing: 0.35,
    fontFamily: "optima-light",
    letterSpacing: 0.8,
    fontWeight: "300",
    recipe: {
      description: "适合观点分析、案例复盘和视觉内容",
      introStyle: "editorial",
      tocStyle: "compact",
      codeStyle: "light",
      underlineWidth: 2,
    },
  },
};

export function getDefaultSettings(): StyleSettings {
  const preset = themePresets["supo-minimal"];
  return {
    theme: preset.name,
    primaryColor: preset.primaryColor,
    backgroundColor: preset.backgroundColor,
    textColor: preset.textColor,
    fontSize: preset.fontSize,
    lineHeight: preset.lineHeight,
    headingFontSize: preset.headingFontSize,
    borderRadius: preset.borderRadius,
    contentWidth: preset.contentWidth,
    h2Style: preset.h2Style,
    boldStyle: preset.boldStyle,
    paragraphSpacing: preset.paragraphSpacing,
    sectionSpacing: preset.sectionSpacing,
    listIndent: preset.listIndent,
    listItemSpacing: preset.listItemSpacing,
    fontFamily: preset.fontFamily,
    letterSpacing: preset.letterSpacing,
    fontWeight: preset.fontWeight,
  };
}

export function applyThemePreset(
  settings: StyleSettings,
  theme: ThemeName
): StyleSettings {
  const preset = themePresets[theme];
  return {
    ...settings,
    theme,
    primaryColor: preset.primaryColor,
    backgroundColor: preset.backgroundColor,
    textColor: preset.textColor,
    fontSize: preset.fontSize,
    lineHeight: preset.lineHeight,
    headingFontSize: preset.headingFontSize,
    borderRadius: preset.borderRadius,
    contentWidth: preset.contentWidth,
    h2Style: preset.h2Style,
    boldStyle: preset.boldStyle,
    paragraphSpacing: preset.paragraphSpacing,
    sectionSpacing: preset.sectionSpacing,
    listIndent: preset.listIndent,
    listItemSpacing: preset.listItemSpacing,
    fontFamily: preset.fontFamily,
    letterSpacing: preset.letterSpacing,
    fontWeight: preset.fontWeight,
  };
}
