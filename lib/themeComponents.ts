import { ArticleHeading, ArticleType } from "./articleTypes";
import { escapeAttribute, hexToRgba, leaf, safeURL, toStyleString } from "./htmlUtils";
import { StyleSettings, themePresets } from "./themeConfig";

export interface ThemeComponentContext {
  settings: StyleSettings;
  fontStack: string;
  articleType: ArticleType;
}

export function renderArticleTitle(title: string, context: ThemeComponentContext): string {
  if (!title) return "";
  const { settings, fontStack } = context;
  return `<section style="${toStyleString({
    margin: "0 0 24px",
    paddingBottom: "18px",
    borderBottom: `1px solid ${hexToRgba(settings.textColor, 0.12)}`,
  })}"><p style="${toStyleString({
    margin: "0",
    color: settings.textColor,
    fontFamily: fontStack,
    fontSize: `${settings.headingFontSize}px`,
    fontWeight: "700",
    lineHeight: "1.35",
    letterSpacing: `${settings.letterSpacing}px`,
  })}">${leaf(title)}</p></section>`;
}

export function renderIntroCard(intro: string, context: ThemeComponentContext): string {
  if (!intro) return "";
  const { settings, fontStack } = context;
  const recipe = themePresets[settings.theme].recipe;
  const shared = {
    margin: "0 0 26px",
    padding: recipe.introStyle === "minimal" ? "18px 4px" : "18px 20px",
    backgroundColor:
      recipe.introStyle === "minimal"
        ? "transparent"
        : hexToRgba(settings.primaryColor, recipe.introStyle === "editorial" ? 0.045 : 0.08),
    borderLeft:
      recipe.introStyle === "editorial" || recipe.introStyle === "card"
        ? `4px solid ${settings.primaryColor}`
        : undefined,
    borderTop:
      recipe.introStyle === "minimal"
        ? `1px solid ${hexToRgba(settings.primaryColor, 0.25)}`
        : undefined,
    borderBottom:
      recipe.introStyle === "minimal"
        ? `1px solid ${hexToRgba(settings.primaryColor, 0.25)}`
        : undefined,
    borderRadius: recipe.introStyle === "card" ? `${settings.borderRadius}px` : "0",
  };
  const paragraphs = intro
    .split(/\n+/)
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="${toStyleString({
          margin: "0 0 6px",
          color: settings.textColor,
          fontFamily: fontStack,
          fontSize: `${Math.max(14, settings.fontSize)}px`,
          fontWeight: "500",
          lineHeight: "1.8",
        })}">${leaf(line)}</p>`
    )
    .join("");
  return `<section style="${toStyleString(shared)}">${paragraphs}</section>`;
}

export function renderToc(headings: ArticleHeading[], context: ThemeComponentContext): string {
  if (!headings.length) return "";
  const { settings, fontStack } = context;
  const recipe = themePresets[settings.theme].recipe;
  const items = headings
    .slice(0, 3)
    .map((heading, index) => {
      const number = String(index + 1).padStart(2, "0");
      return `<p style="${toStyleString({
        margin: index === headings.length - 1 ? "0" : "0 0 9px",
        fontFamily: fontStack,
        fontSize: `${Math.max(13, settings.fontSize - 1)}px`,
        lineHeight: "1.65",
        color: settings.textColor,
      })}"><span style="${toStyleString({
        color: settings.primaryColor,
        fontWeight: "700",
        marginRight: "10px",
        fontSize: "12px",
      })}">${leaf(number)}</span>${leaf(heading.text)}</p>`;
    })
    .join("");
  return `<section style="${toStyleString({
    margin: "0 0 28px",
    padding: recipe.tocStyle === "compact" ? "16px 18px" : "18px 20px",
    backgroundColor: hexToRgba(settings.primaryColor, 0.055),
    borderRadius: `${settings.borderRadius}px`,
    border: `1px solid ${hexToRgba(settings.primaryColor, 0.16)}`,
  })}"><p style="${toStyleString({
    margin: "0 0 12px",
    color: settings.primaryColor,
    fontFamily: fontStack,
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
  })}">${leaf("导读 · CONTENTS")}</p>${items}</section>`;
}

export function renderCodeBlock(
  code: string,
  language: string,
  context: ThemeComponentContext
): string {
  const { settings } = context;
  const dark = themePresets[settings.theme].recipe.codeStyle === "dark";
  const background = dark ? "#1E293B" : "#F6F8FA";
  const toolbar = dark ? "#0F172A" : "#EEF1F4";
  const text = dark ? "#E2E8F0" : "#24292F";
  const lines = code.replace(/\n$/, "").split("\n");
  const renderedLines = (lines.length ? lines : [""])
    .map((line) => {
      const preserved = line ? line.replace(/\t/g, "　　").replace(/ /g, "\u00a0") : "\u200b";
      return `<p style="${toStyleString({
        margin: "0",
        fontFamily: "'SF Mono',Consolas,Monaco,monospace",
        fontSize: `${Math.max(12, Math.round(settings.fontSize * 0.88))}px`,
        lineHeight: "1.6",
        color: text,
        overflowWrap: "anywhere",
      })}">${leaf(preserved)}</p>`;
    })
    .join("");
  return `<section style="${toStyleString({
    margin: `0 0 ${settings.paragraphSpacing}em`,
    borderRadius: `${settings.borderRadius}px`,
    overflow: "hidden",
    backgroundColor: background,
    border: dark ? "none" : `1px solid ${hexToRgba(settings.textColor, 0.12)}`,
    borderLeft: dark ? undefined : `3px solid ${settings.primaryColor}`,
  })}"><section style="${toStyleString({
    padding: "8px 14px",
    backgroundColor: toolbar,
    borderBottom: dark ? "none" : `1px solid ${hexToRgba(settings.textColor, 0.1)}`,
  })}"><span style="font-family:Consolas,Monaco,monospace;font-size:12px;color:${dark ? "#94A3B8" : "#8B949E"};letter-spacing:1px;">${leaf(
    language || "CODE"
  )}</span></section><section style="padding:11px 14px;">${renderedLines}</section></section>`;
}

export function renderImage(
  source: string,
  alt: string,
  context: ThemeComponentContext
): string {
  const { settings, fontStack } = context;
  const safeSource = safeURL(source, "image");
  if (!safeSource) {
    return `<section style="${toStyleString({
      margin: "0 0 20px",
      padding: "20px",
      backgroundColor: hexToRgba(settings.primaryColor, 0.06),
      borderLeft: `4px solid ${settings.primaryColor}`,
      borderRadius: `${settings.borderRadius}px`,
    })}"><p style="margin:0;color:${settings.textColor};font-size:13px;">${leaf(
      "图片地址不安全，已阻止加载"
    )}</p></section>`;
  }
  const caption = alt
    ? `<p style="${toStyleString({
        margin: "8px 0 22px",
        textAlign: "center",
        color: hexToRgba(settings.textColor, 0.56),
        fontFamily: fontStack,
        fontSize: `${Math.max(11, Math.round(settings.fontSize * 0.82))}px`,
        lineHeight: "1.6",
      })}">${leaf(`— ${alt}`)}</p>`
    : "";
  return `<section style="${toStyleString({
    margin: alt ? "0 0 6px" : "0 0 20px",
    padding: "6px",
    backgroundColor: "#FFFFFF",
    border: `1px solid ${hexToRgba(settings.textColor, 0.1)}`,
    borderRadius: `${Math.max(4, settings.borderRadius)}px`,
  })}"><section style="overflow:hidden;border-radius:${Math.max(2, settings.borderRadius - 2)}px;"><span leaf=""><img src="${escapeAttribute(
    safeSource
  )}" alt="${escapeAttribute(alt)}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span></section></section>${caption}`;
}

export function renderSignature(
  authorName: string,
  authorBio: string,
  context: ThemeComponentContext
): string {
  const { settings, fontStack } = context;
  const name = authorName.trim() || "{{作者名}}";
  const bio = authorBio.trim() || "{{一句话简介}}";
  return `<section style="${toStyleString({
    margin: "34px 0 0",
    padding: "18px 20px",
    backgroundColor: hexToRgba(settings.primaryColor, 0.06),
    borderTop: `2px solid ${settings.primaryColor}`,
    borderRadius: `${settings.borderRadius}px`,
  })}"><p style="${toStyleString({
    margin: "0 0 8px",
    color: settings.textColor,
    fontFamily: fontStack,
    fontSize: `${Math.max(13, settings.fontSize - 1)}px`,
    lineHeight: "1.75",
  })}">${leaf(`我是 ${name}，${bio}`)}</p><p style="${toStyleString({
    margin: "0",
    color: settings.textColor,
    fontFamily: fontStack,
    fontSize: `${Math.max(13, settings.fontSize - 1)}px`,
    lineHeight: "1.75",
  })}">${leaf("如果你觉得今天这篇有收获，欢迎点赞、在看、转发，我们下篇见。")}</p></section>`;
}
