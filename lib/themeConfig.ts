import { FontFamily, FontWeight } from "./fonts";

export type ThemeName = "supo-minimal" | "ai-project" | "design-case";
export type H2Style = "left-border" | "tag-label" | "numbered" | "divider" | "plain";
export type BoldStyle = "bold-only" | "primary-color" | "highlight" | "underline";

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
