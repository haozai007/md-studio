import type { ThemeModuleName, ThemeModules, ThemeName } from "./types";

const moduleDesigns: Record<ThemeName, ThemeModules> = {
  "supo-minimal": {
    articleTitle: { enabled: true, variant: "editorial-rule", options: { align: "left", eyebrow: "SUPO · NOTE", ruleWidth: 42 } },
    intro: { enabled: true, variant: "lime-note", options: { label: "先说重点", marker: "●", padding: 18 } },
    toc: { enabled: true, variant: "clean-index", options: { label: "文章导览", maxItems: 4, showRule: true } },
    h2: { enabled: true, variant: "lime-rail", options: { numberStyle: "plain", railWidth: 5 } },
    blockquote: { enabled: true, variant: "minimal-quote", options: { quoteMark: "“", showBackground: false } },
    image: { enabled: true, variant: "paper-frame", options: { padding: 5, captionPrefix: "FIG." } },
    signature: { enabled: true, variant: "compact-signoff", options: { label: "ABOUT THE AUTHOR", showRule: true } },
  },
  "ai-project": {
    articleTitle: { enabled: true, variant: "tech-hero", options: { align: "left", eyebrow: "AI PROJECT / BUILD LOG", badge: "● ONLINE" } },
    intro: { enabled: true, variant: "terminal-card", options: { label: "PROJECT BRIEF", marker: ">_", padding: 20 } },
    toc: { enabled: true, variant: "data-index", options: { label: "SYSTEM INDEX", maxItems: 5, showRule: true } },
    h2: { enabled: true, variant: "number-chip", options: { numberStyle: "chip", railWidth: 0 } },
    blockquote: { enabled: true, variant: "signal-panel", options: { quoteMark: "//", showBackground: true } },
    image: { enabled: true, variant: "screen-frame", options: { padding: 8, captionPrefix: "OUTPUT" } },
    signature: { enabled: true, variant: "project-footer", options: { label: "END OF BUILD LOG", showRule: true } },
  },
  "light-note-blue": {
    articleTitle: { enabled: true, variant: "soft-letter", options: { align: "center", eyebrow: "A LIGHT NOTE", ruleWidth: 28 } },
    intro: { enabled: true, variant: "airy-note", options: { label: "写在前面", marker: "✦", padding: 16 } },
    toc: { enabled: true, variant: "quiet-index", options: { label: "慢慢读", maxItems: 4, showRule: false } },
    h2: { enabled: true, variant: "center-underline", options: { numberStyle: "hidden", railWidth: 0 } },
    blockquote: { enabled: true, variant: "soft-quote", options: { quoteMark: "“", showBackground: true } },
    image: { enabled: true, variant: "soft-photo", options: { padding: 0, captionPrefix: "" } },
    signature: { enabled: true, variant: "letter-signoff", options: { label: "感谢读到这里", showRule: false } },
  },
  "design-case": {
    articleTitle: { enabled: true, variant: "magazine-cover", options: { align: "left", eyebrow: "DESIGN CASE STUDY", badge: "CASE / 01" } },
    intro: { enabled: true, variant: "case-abstract", options: { label: "ABSTRACT", marker: "↳", padding: 22 } },
    toc: { enabled: true, variant: "editorial-index", options: { label: "CONTENTS", maxItems: 5, showRule: true } },
    h2: { enabled: true, variant: "magazine-divider", options: { numberStyle: "plain", railWidth: 0 } },
    blockquote: { enabled: true, variant: "pull-quote", options: { quoteMark: "“", showBackground: false } },
    image: { enabled: true, variant: "gallery-frame", options: { padding: 10, captionPrefix: "PLATE" } },
    signature: { enabled: true, variant: "case-colophon", options: { label: "CASE NOTES", showRule: true } },
  },
};

export function getThemeModules(name: ThemeName): ThemeModules {
  return moduleDesigns[name];
}

export const themeModuleLabels: Record<ThemeModuleName, string> = {
  articleTitle: "文章标题",
  intro: "导读卡片",
  toc: "目录",
  h2: "H2 标题",
  blockquote: "引用块",
  image: "图片与图注",
  signature: "作者签名区",
};

export function listModuleVariants(module: ThemeModuleName) {
  return (Object.keys(moduleDesigns) as ThemeName[]).map((theme) => ({
    value: moduleDesigns[theme][module].variant,
    label: `${themeModuleLabels[module]} · ${theme === "supo-minimal" ? "极简" : theme === "ai-project" ? "科技" : theme === "light-note-blue" ? "轻盈" : "杂志"}`,
  }));
}

export function resolveThemeModules(
  theme: ThemeName,
  overrides: Partial<Record<ThemeModuleName, string>> = {}
): ThemeModules {
  const base = moduleDesigns[theme];
  return Object.fromEntries(
    (Object.keys(base) as ThemeModuleName[]).map((module) => {
      const variant = overrides[module];
      if (!variant) return [module, base[module]];
      const source = (Object.keys(moduleDesigns) as ThemeName[])
        .map((name) => moduleDesigns[name][module])
        .find((definition) => definition.variant === variant);
      return [module, source || base[module]];
    })
  ) as ThemeModules;
}
