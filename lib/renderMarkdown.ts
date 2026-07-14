import MarkdownIt from "markdown-it";
import { ArticleAnalysis, ArticleType, SmartFormattingSettings } from "./articleTypes";
import { analyzeArticle } from "./articleAnalysis";
import { getFontStack, fontOptions } from "./fonts";
import {
  clamp,
  escapeAttribute,
  hexToRgba,
  leaf,
  normalizeChinesePunctuation,
  safeURL,
  toStyleString,
} from "./htmlUtils";
import {
  renderArticleTitle,
  renderCodeBlock,
  renderImage,
  renderIntroCard,
  renderSignature,
  renderToc,
  getThemeRenderers,
  ThemeComponentContext,
} from "./themeComponents";
import { StyleSettings } from "./themeConfig";
import { getTheme, getThemeOrDefault, isThemeName } from "./themes/registry";
import { validateWechatHTML, ValidationReport } from "./wechatValidator";
import { installChineseStrongCompatibility, repairChineseStrongBoundaries } from "./markdownCompatibility";

export interface RenderOptions {
  smart?: SmartFormattingSettings;
  analysis?: ArticleAnalysis;
  acceptedKeywordIds?: string[];
}

export interface RenderResult {
  html: string;
  plainText: string;
  analysis: ArticleAnalysis;
  validation: ValidationReport;
}

function normalizeSettings(settings: StyleSettings): StyleSettings {
  const fallback = getThemeOrDefault(settings.theme);
  const color = (value: string, defaultValue: string) =>
    /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : defaultValue;
  return {
    ...fallback,
    ...settings,
    theme: isThemeName(settings.theme) ? settings.theme : "supo-minimal",
    primaryColor: color(settings.primaryColor, fallback.primaryColor),
    backgroundColor: color(settings.backgroundColor, fallback.backgroundColor),
    textColor: color(settings.textColor, fallback.textColor),
    fontSize: clamp(settings.fontSize, 13, 22),
    lineHeight: clamp(settings.lineHeight, 1.3, 2.5),
    headingFontSize: clamp(settings.headingFontSize, 18, 36),
    borderRadius: clamp(settings.borderRadius, 0, 24),
    contentWidth: clamp(settings.contentWidth, 360, 720),
    paragraphSpacing: clamp(settings.paragraphSpacing, 0.2, 2),
    sectionSpacing: clamp(settings.sectionSpacing, 0.5, 3.5),
    listIndent: clamp(settings.listIndent, 0.5, 2.5),
    listItemSpacing: clamp(settings.listItemSpacing, 0, 0.8),
    letterSpacing: clamp(settings.letterSpacing, 0, 2),
    fontFamily: fontOptions[settings.fontFamily] ? settings.fontFamily : fallback.fontFamily,
    fontWeight: settings.fontWeight === "300" ? "300" : "400",
    moduleVariants: settings.moduleVariants || {},
  };
}

function stripSmartDecorations(
  markdown: string,
  analysis: ArticleAnalysis,
  smart: SmartFormattingSettings
): string {
  const lines = markdown.split(/\r?\n/);
  const titleIndex = lines.findIndex((line) => /^#\s+/.test(line));
  if (titleIndex >= 0) lines.splice(titleIndex, 1);
  if (smart.showIntro && analysis.intro) {
    let cursor = Math.max(0, titleIndex);
    while (cursor < lines.length && !lines[cursor].trim()) cursor++;
    if (/^>/.test(lines[cursor] || "")) {
      while (cursor < lines.length && (/^>/.test(lines[cursor]) || !lines[cursor].trim())) {
        lines.splice(cursor, 1);
      }
    }
  }
  return lines.join("\n").replace(/^\s+/, "");
}

function plainTextFromMarkdown(markdown: string): string {
  return markdown
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/```[\s\S]*?```/g, (value) => value.replace(/^```[^\n]*|```$/g, ""))
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~`]/g, "")
    .trim();
}

function renderHighlightedText(
  value: string,
  phrases: string[],
  color: string,
  width: number
): string {
  const normalized = normalizeChinesePunctuation(value);
  if (!phrases.length) return leaf(normalized);
  const matches: { start: number; end: number }[] = [];
  phrases
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .forEach((phrase) => {
      let cursor = 0;
      while (cursor < normalized.length) {
        const start = normalized.indexOf(phrase, cursor);
        if (start < 0) break;
        const end = start + phrase.length;
        if (!matches.some((item) => start < item.end && end > item.start)) matches.push({ start, end });
        cursor = end;
      }
    });
  if (!matches.length) return leaf(normalized);
  matches.sort((a, b) => a.start - b.start);
  let cursor = 0;
  let result = "";
  matches.forEach((match) => {
    if (match.start > cursor) result += leaf(normalized.slice(cursor, match.start));
    result += `<span style="border-bottom:${width}px solid ${hexToRgba(color, 0.35)};font-weight:600;">${leaf(
      normalized.slice(match.start, match.end)
    )}</span>`;
    cursor = match.end;
  });
  if (cursor < normalized.length) result += leaf(normalized.slice(cursor));
  return result;
}

function buildRenderer(
  markdown: string,
  settings: StyleSettings,
  mode: "preview" | "export",
  context: ThemeComponentContext,
  smart: SmartFormattingSettings | undefined,
  analysis: ArticleAnalysis,
  acceptedKeywordIds: string[]
): string {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: true, breaks: true });
  installChineseStrongCompatibility(md);
  md.validateLink = (url) => safeURL(url, "link") !== null;

  const fontStack = getFontStack(settings.fontFamily, mode);
  const headingSizes: Record<string, number> = {
    h1: settings.headingFontSize,
    h2: Math.round(settings.headingFontSize * 0.85),
    h3: Math.round(settings.headingFontSize * 0.72),
    h4: Math.round(settings.headingFontSize * 0.62),
  };
  const acceptedPhrases = analysis.keywordCandidates
    .filter((candidate) => acceptedKeywordIds.includes(candidate.id))
    .map((candidate) => candidate.phrase);
  const underlineWidth = getTheme(settings.theme).recipe.underlineWidth;
  const effectiveType: ArticleType = smart?.articleType && smart.articleType !== "auto" ? smart.articleType : analysis.articleType;
  const themeRenderers = getThemeRenderers(context);
  let h2Counter = 0;
  let insideParagraph = false;
  let insideHeading = false;
  let insideCode = false;
  let skipParagraph = false;
  let listItemDepth = 0;
  const listStack: { ordered: boolean; index: number }[] = [];

  const isImageOnlyParagraph = (tokens: Parameters<NonNullable<typeof md.renderer.rules.paragraph_open>>[0], index: number) => {
    const inline = tokens[index + 1];
    return (
      inline?.type === "inline" &&
      !!inline.children?.length &&
      inline.children.every((child) => child.type === "image" || (child.type === "text" && !child.content.trim()))
    );
  };

  md.renderer.rules.text = (tokens, index) => {
    const value = tokens[index].content;
    if (insideCode || insideHeading || !insideParagraph || !smart?.enabled || !smart.highlightKeywords) {
      return leaf(insideCode ? value : normalizeChinesePunctuation(value));
    }
    return renderHighlightedText(value, acceptedPhrases, settings.primaryColor, underlineWidth);
  };

  md.renderer.rules.heading_open = (tokens, index) => {
    insideHeading = true;
    const tag = tokens[index].tag;
    const size = headingSizes[tag] || settings.headingFontSize;
    const title = tokens[index + 1]?.content || "";
    const isH2 = tag === "h2";
    const isConclusion = isH2 && /^(结语|总结|写在最后|最后的话|尾声|小结|结论|后记|尾记)/.test(title);
    let prefix = "";
    if (isH2) {
      h2Counter++;
      if (smart?.enabled && smart.numberSections && effectiveType !== "essay") {
        prefix = `<span style="color:${settings.primaryColor};font-size:${Math.round(size * 0.78)}px;font-weight:700;margin-right:10px;">${leaf(
          isConclusion ? "∞" : String(h2Counter).padStart(2, "0")
        )}</span>`;
      }
    }
    return themeRenderers.headingOpen({ tag, size, title, isH2, isConclusion, prefix }, context);
  };
  md.renderer.rules.heading_close = () => {
    insideHeading = false;
    return themeRenderers.headingClose(context);
  };

  md.renderer.rules.paragraph_open = (tokens, index) => {
    skipParagraph = isImageOnlyParagraph(tokens, index);
    insideParagraph = !skipParagraph;
    if (skipParagraph) return "";
    return `<p style="${toStyleString({
      margin: listItemDepth ? "0" : `0 0 ${settings.paragraphSpacing}em`,
      fontFamily: fontStack,
      fontWeight: settings.fontWeight,
      letterSpacing: `${settings.letterSpacing}px`,
      fontSize: `${settings.fontSize}px`,
      lineHeight: String(settings.lineHeight),
      color: settings.textColor,
    })}">`;
  };
  md.renderer.rules.paragraph_close = () => {
    insideParagraph = false;
    const result = skipParagraph ? "" : "</p>";
    skipParagraph = false;
    return result;
  };

  md.renderer.rules.blockquote_open = () => themeRenderers.blockquoteOpen(context);
  md.renderer.rules.blockquote_close = () => themeRenderers.blockquoteClose(context);

  md.renderer.rules.bullet_list_open = () => {
    listStack.push({ ordered: false, index: 0 });
    return `<section style="margin:0 0 ${settings.paragraphSpacing}em;padding-left:${settings.listIndent}em;">`;
  };
  md.renderer.rules.bullet_list_close = () => {
    listStack.pop();
    return "</section>";
  };
  md.renderer.rules.ordered_list_open = (tokens, index) => {
    const start = Number(tokens[index].attrGet("start") || "1") - 1;
    listStack.push({ ordered: true, index: start });
    return `<section style="margin:0 0 ${settings.paragraphSpacing}em;padding-left:${settings.listIndent}em;">`;
  };
  md.renderer.rules.ordered_list_close = () => {
    listStack.pop();
    return "</section>";
  };
  md.renderer.rules.list_item_open = () => {
    const current = listStack[listStack.length - 1];
    if (current) current.index++;
    listItemDepth++;
    const marker = current?.ordered ? `${current.index}.` : "•";
    return `<section style="display:flex;align-items:flex-start;margin:0 0 ${settings.listItemSpacing}em;"><span style="display:inline-block;min-width:1.5em;color:${settings.primaryColor};font-weight:700;line-height:${settings.lineHeight};">${leaf(
      marker
    )}</span><section style="flex:1;min-width:0;">`;
  };
  md.renderer.rules.list_item_close = () => {
    listItemDepth--;
    return "</section></section>";
  };

  md.renderer.rules.code_inline = (tokens, index) => {
    return `<span style="${toStyleString({
      backgroundColor: "#F1F5F9",
      color: settings.primaryColor,
      padding: "1px 6px",
      borderRadius: `${Math.max(2, Math.round(settings.borderRadius / 2))}px`,
      fontFamily: "'SF Mono',Consolas,Monaco,monospace",
      fontSize: `${Math.round(settings.fontSize * 0.9)}px`,
    })}">${leaf(tokens[index].content)}</span>`;
  };
  md.renderer.rules.code_block = (tokens, index) => {
    insideCode = true;
    const rendered = renderCodeBlock(tokens[index].content, "", context);
    insideCode = false;
    return rendered;
  };
  md.renderer.rules.fence = (tokens, index) => {
    insideCode = true;
    const language = tokens[index].info.trim().split(/\s+/)[0] || "";
    const rendered = renderCodeBlock(tokens[index].content, language, context);
    insideCode = false;
    return rendered;
  };

  md.renderer.rules.link_open = (tokens, index) => {
    const href = safeURL(tokens[index].attrGet("href") || "", "link");
    return href
      ? `<a href="${escapeAttribute(href)}" style="color:${settings.primaryColor};text-decoration:underline;">`
      : `<span style="color:${settings.textColor};">`;
  };
  md.renderer.rules.link_close = (tokens, index, options, env, renderer) => {
    const openIndex = tokens.slice(0, index).map((token) => token.type).lastIndexOf("link_open");
    const href = openIndex >= 0 ? safeURL(tokens[openIndex].attrGet("href") || "", "link") : null;
    return href ? "</a>" : "</span>";
  };
  md.renderer.rules.em_open = () => `<span style="font-style:italic;">`;
  md.renderer.rules.em_close = () => "</span>";
  md.renderer.rules.s_open = () => `<span style="text-decoration:line-through;">`;
  md.renderer.rules.s_close = () => "</span>";
  md.renderer.rules.strong_open = () => {
    if (settings.boldStyle === "primary-color") return `<strong style="color:${settings.primaryColor};font-weight:700;">`;
    if (settings.boldStyle === "highlight") return `<strong style="background:${hexToRgba(settings.primaryColor, 0.2)};padding:1px 3px;border-radius:2px;font-weight:700;">`;
    if (settings.boldStyle === "underline") return `<strong style="border-bottom:2px solid ${hexToRgba(settings.primaryColor, 0.42)};font-weight:700;">`;
    return `<strong style="font-weight:700;">`;
  };
  md.renderer.rules.strong_close = () => "</strong>";

  md.renderer.rules.image = (tokens, index) => {
    const source = tokens[index].attrGet("src") || "";
    return renderImage(source, tokens[index].content || "", context);
  };
  md.renderer.rules.hr = () => `<section style="height:1px;border-top:1px solid ${hexToRgba(settings.textColor, 0.12)};margin:${settings.sectionSpacing}em 0;"></section>`;
  md.renderer.rules.hardbreak = () => "<br>";
  md.renderer.rules.softbreak = () => "<br>";

  let tableHeader = false;
  let tableColumnCount = 0;
  md.renderer.rules.table_open = () => `<section style="margin:0 0 ${settings.paragraphSpacing}em;border:1px solid ${hexToRgba(settings.textColor, 0.14)};border-radius:${settings.borderRadius}px;overflow:hidden;">`;
  md.renderer.rules.table_close = () => "</section>";
  md.renderer.rules.thead_open = () => {
    tableHeader = true;
    return "";
  };
  md.renderer.rules.thead_close = () => {
    tableHeader = false;
    return "";
  };
  md.renderer.rules.tbody_open = () => "";
  md.renderer.rules.tbody_close = () => "";
  md.renderer.rules.tr_open = () => {
    tableColumnCount = 0;
    return `<section style="display:flex;align-items:stretch;border-bottom:1px solid ${hexToRgba(settings.textColor, 0.1)};">`;
  };
  md.renderer.rules.tr_close = () => "</section>";
  const cellOpen = () => {
    tableColumnCount++;
    return `<section style="flex:1;min-width:0;padding:9px 10px;border-right:1px solid ${hexToRgba(settings.textColor, 0.1)};background:${
      tableHeader ? hexToRgba(settings.primaryColor, 0.12) : settings.backgroundColor
    };font-size:${Math.max(12, Math.round(settings.fontSize * 0.9))}px;line-height:1.6;overflow-wrap:anywhere;${
      tableHeader ? "font-weight:700;" : ""
    }">`;
  };
  md.renderer.rules.th_open = cellOpen;
  md.renderer.rules.th_close = () => "</section>";
  md.renderer.rules.td_open = cellOpen;
  md.renderer.rules.td_close = () => "</section>";

  const body = md.render(repairChineseStrongBoundaries(markdown));
  return body;
}

export function compileWechatArticle(
  markdown: string,
  settingsInput: StyleSettings,
  mode: "preview" | "export" = "preview",
  options: RenderOptions = {}
): RenderResult {
  const settings = normalizeSettings(settingsInput);
  const analysis = options.analysis || analyzeArticle(markdown);
  const smart = options.smart;
  const fontStack = getFontStack(settings.fontFamily, mode);
  const articleType: ArticleType = smart?.articleType && smart.articleType !== "auto" ? smart.articleType : analysis.articleType;
  const context: ThemeComponentContext = { settings, fontStack, articleType };
  const source = smart?.enabled ? stripSmartDecorations(markdown, analysis, smart) : markdown;
  const acceptedKeywordIds = options.acceptedKeywordIds || [];
  let content = "";
  if (smart?.enabled) {
    content += renderArticleTitle(analysis.title, context);
    if (smart.showIntro && analysis.intro) content += renderIntroCard(analysis.intro, context);
    if (smart.showToc && analysis.toc.length >= 1) content += renderToc(analysis.toc, context);
  }
  content += buildRenderer(source, settings, mode, context, smart, analysis, acceptedKeywordIds);
  const hasSignature = /(我是.{1,20}[，,]|(?:作者|撰文|文)[：:]|点赞|在看|转发|下篇见)/.test(markdown.slice(-500));
  if (smart?.enabled && smart.showSignature && !hasSignature) {
    content += renderSignature(smart.authorName, smart.authorBio, context);
  }
  const html = `<section style="${toStyleString({
    backgroundColor: settings.backgroundColor,
    padding: "32px 24px",
    fontFamily: fontStack,
    fontWeight: settings.fontWeight,
    letterSpacing: `${settings.letterSpacing}px`,
    maxWidth: `${settings.contentWidth}px`,
    margin: "0 auto",
    minHeight: "100%",
  })}">${content}</section>`;
  return {
    html,
    plainText: plainTextFromMarkdown(markdown),
    analysis,
    validation: validateWechatHTML(html),
  };
}

export function renderMarkdown(
  markdown: string,
  settings: StyleSettings,
  mode: "preview" | "export" = "preview",
  options: RenderOptions = {}
): string {
  return compileWechatArticle(markdown, settings, mode, options).html;
}

export function wrapExportHTML(bodyHTML: string, settings: StyleSettings): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MD Studio Export</title>
</head>
<body style="margin:0;background:#E8E8E0;display:flex;justify-content:center;padding:40px 0;">
  ${bodyHTML}
</body>
</html>`;
}
