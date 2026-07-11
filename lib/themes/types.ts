import type { FontFamily, FontWeight } from "../fonts";
import type { ArticleHeading, ArticleType } from "../articleTypes";
import type { StyleSettings } from "../themeConfig";

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

/**
 * Stable contract for a theme. Later phases can add module definitions and
 * renderer overrides here without coupling them to the settings panel.
 */
export interface ThemeComponentContext {
  settings: StyleSettings;
  fontStack: string;
  articleType: ArticleType;
}

export interface HeadingRenderInput {
  tag: string;
  size: number;
  title: string;
  isH2: boolean;
  isConclusion: boolean;
  prefix: string;
}

export interface ThemeRenderers {
  articleTitle: (title: string, context: ThemeComponentContext) => string;
  intro: (intro: string, context: ThemeComponentContext) => string;
  toc: (headings: ArticleHeading[], context: ThemeComponentContext) => string;
  headingOpen: (input: HeadingRenderInput, context: ThemeComponentContext) => string;
  headingClose: (context: ThemeComponentContext) => string;
  blockquoteOpen: (context: ThemeComponentContext) => string;
  blockquoteClose: (context: ThemeComponentContext) => string;
  image: (source: string, alt: string, context: ThemeComponentContext) => string;
  signature: (authorName: string, authorBio: string, context: ThemeComponentContext) => string;
}

export type ThemeModuleName =
  | "articleTitle"
  | "intro"
  | "toc"
  | "h2"
  | "blockquote"
  | "image"
  | "signature";

export type ThemeModuleOption = string | number | boolean;
export interface ThemeModuleDefinition {
  enabled: boolean;
  variant: string;
  options: Record<string, ThemeModuleOption>;
}
export type ThemeModules = Record<ThemeModuleName, ThemeModuleDefinition>;

export interface ThemeDefinition extends ThemePreset {
  modules: ThemeModules;
  renderers: Partial<ThemeRenderers>;
}
