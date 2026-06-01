// Phase 1 — system font stacks only
// Phase 2 will add Noto Sans SC, Noto Serif SC, LXGW WenKai Screen with local woff2

export type FontFamily = "optima-light" | "system-default";
export type FontWeight = "300" | "400";

export interface FontOption {
  id: FontFamily;
  label: string;
  categoryLabel: string;
  previewStack: string;
  exportStack: string;
  defaultLetterSpacing: number;
  defaultWeight: FontWeight;
}

export const fontOptions: Record<FontFamily, FontOption> = {
  "optima-light": {
    id: "optima-light",
    label: "理想轻盈体",
    categoryLabel: "系统字体优先",
    previewStack:
      "Optima-Regular, 'PingFang SC', 'PingFang TC', 'Microsoft YaHei', sans-serif",
    exportStack:
      "Optima-Regular, 'PingFang SC', 'PingFang TC', 'Microsoft YaHei', sans-serif",
    defaultLetterSpacing: 0.5,
    defaultWeight: "300",
  },
  "system-default": {
    id: "system-default",
    label: "系统默认体",
    categoryLabel: "系统字体优先",
    previewStack:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    exportStack:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    defaultLetterSpacing: 0,
    defaultWeight: "400",
  },
};

export function getFontStack(
  family: FontFamily,
  mode: "preview" | "export"
): string {
  const opt = fontOptions[family];
  return mode === "export" ? opt.exportStack : opt.previewStack;
}
