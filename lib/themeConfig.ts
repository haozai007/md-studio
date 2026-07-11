import type { FontFamily, FontWeight } from "./fonts";
import { getTheme, themeRegistry } from "./themes/registry";
import type { BoldStyle, H2Style, ThemeModuleName, ThemeName } from "./themes/types";

export type {
  BoldStyle,
  CodeStyle,
  H2Style,
  IntroStyle,
  ThemeDefinition,
  ThemeName,
  ThemePreset,
  ThemeRecipe,
  TocStyle,
} from "./themes/types";

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
  moduleVariants: Partial<Record<ThemeModuleName, string>>;
}

// Compatibility export: existing consumers keep working while all theme data
// now has a single source of truth in the registry.
export const themePresets = themeRegistry;

function settingsFromTheme(theme: ThemeName): StyleSettings {
  const { recipe: _recipe, label: _label, modules: _modules, renderers: _renderers, name, ...settings } = getTheme(theme);
  return { ...settings, theme: name, moduleVariants: {} };
}

export function getDefaultSettings(): StyleSettings {
  return settingsFromTheme("supo-minimal");
}

export function applyThemePreset(settings: StyleSettings, theme: ThemeName): StyleSettings {
  return { ...settings, ...settingsFromTheme(theme) };
}
