import MarkdownIt from "markdown-it";
import { StyleSettings } from "./themeConfig";
import { getFontStack, fontOptions } from "./fonts";

function toStyleString(
  styles: Record<string, string | number | undefined>
): string {
  return Object.entries(styles)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) =>
        `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}`
    )
    .join("; ");
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function renderMarkdown(
  markdown: string,
  settings: StyleSettings,
  mode: "preview" | "export" = "preview"
): string {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
  });

  const {
    primaryColor,
    textColor,
    fontSize,
    lineHeight,
    headingFontSize,
    borderRadius,
    backgroundColor,
    h2Style,
    boldStyle,
    paragraphSpacing,
    sectionSpacing,
    listIndent,
    listItemSpacing,
    fontFamily,
    letterSpacing,
    fontWeight,
  } = settings;

  const fontStack = getFontStack(fontFamily, mode);
  const ls = `${letterSpacing}px`;

  const bodyFontStyle = toStyleString({
    fontFamily: fontStack,
    fontWeight,
    letterSpacing: ls,
  });

  const headingSizes: Record<string, number> = {
    h1: headingFontSize,
    h2: Math.round(headingFontSize * 0.85),
    h3: Math.round(headingFontSize * 0.72),
    h4: Math.round(headingFontSize * 0.62),
  };

  let h2Counter = 0;

  md.renderer.rules.heading_open = (tokens, idx) => {
    const tag = tokens[idx].tag;
    const size = headingSizes[tag] || headingFontSize;

    if (tag === "h2") {
      h2Counter++;
      const num = String(h2Counter).padStart(2, "0");

      switch (h2Style) {
        case "left-border":
          return `<h2 style="${toStyleString({
            fontFamily: fontStack,
            letterSpacing: ls,
            fontSize: `${size}px`,
            fontWeight: "700",
            color: textColor,
            marginTop: `${sectionSpacing}em`,
            marginBottom: "0.6em",
            lineHeight: "1.3",
            borderLeft: `4px solid ${primaryColor}`,
            paddingLeft: "16px",
          })}">`;

        case "tag-label":
          return `<h2 style="${toStyleString({
            fontFamily: fontStack,
            letterSpacing: ls,
            fontSize: `${size}px`,
            fontWeight: "700",
            color: textColor,
            marginTop: `${sectionSpacing}em`,
            marginBottom: "0.6em",
            lineHeight: "1.3",
            backgroundColor: hexToRgba(primaryColor, 0.15),
            padding: "8px 16px",
            borderRadius: "4px",
          })}">`;

        case "numbered":
          return `<h2 style="${toStyleString({
            fontFamily: fontStack,
            letterSpacing: ls,
            fontSize: `${size}px`,
            fontWeight: "700",
            color: textColor,
            marginTop: `${sectionSpacing}em`,
            marginBottom: "0.6em",
            lineHeight: "1.3",
          })}"><span style="${toStyleString({
            color: primaryColor,
            fontSize: `${Math.round(size * 0.85)}px`,
            marginRight: "10px",
            fontWeight: "600",
          })}">${num}</span>`;

        case "divider":
          return `<h2 style="${toStyleString({
            fontFamily: fontStack,
            letterSpacing: ls,
            fontSize: `${size}px`,
            fontWeight: "700",
            color: textColor,
            marginTop: `${sectionSpacing}em`,
            marginBottom: "0.8em",
            lineHeight: "1.3",
            textAlign: "center",
            paddingTop: "14px",
            paddingBottom: "14px",
            borderTop: `1px solid ${hexToRgba(textColor, 0.15)}`,
            borderBottom: `1px solid ${hexToRgba(textColor, 0.15)}`,
          })}">`;

        case "plain":
          return `<h2 style="${toStyleString({
            fontFamily: fontStack,
            letterSpacing: ls,
            fontSize: `${size}px`,
            fontWeight: "700",
            color: textColor,
            marginTop: `${sectionSpacing}em`,
            marginBottom: "0.6em",
            lineHeight: "1.3",
          })}">`;
      }
    }

    // h1, h3, h4
    return `<${tag} style="${toStyleString({
      fontFamily: fontStack,
      letterSpacing: ls,
      fontSize: `${size}px`,
      fontWeight: "700",
      color: textColor,
      marginTop: tag === "h1" ? "0" : `${sectionSpacing}em`,
      marginBottom: "0.6em",
      lineHeight: "1.3",
    })}">`;
  };

  md.renderer.rules.heading_close = (tokens, idx) => {
    return `</${tokens[idx].tag}>`;
  };

  md.renderer.rules.paragraph_open = () => {
    return `<p style="${toStyleString({
      fontFamily: fontStack,
      fontWeight,
      letterSpacing: ls,
      fontSize: `${fontSize}px`,
      lineHeight: String(lineHeight),
      color: textColor,
      marginBottom: `${paragraphSpacing}em`,
      marginTop: "0",
    })}">`;
  };

  md.renderer.rules.paragraph_close = () => "</p>";

  md.renderer.rules.blockquote_open = () => {
    return `<blockquote style="${toStyleString({
      fontFamily: fontStack,
      fontWeight,
      letterSpacing: ls,
      borderLeft: `3px solid ${hexToRgba(primaryColor, 0.5)}`,
      marginLeft: "0",
      marginRight: "0",
      marginTop: `${paragraphSpacing}em`,
      marginBottom: `${paragraphSpacing}em`,
      backgroundColor: hexToRgba(primaryColor, 0.08),
      padding: "16px 20px",
      borderRadius: `${borderRadius}px`,
      fontSize: `${Math.round(fontSize * 0.95)}px`,
      lineHeight: String(lineHeight),
      color: textColor,
    })}">`;
  };

  md.renderer.rules.blockquote_close = () => "</blockquote>";

  md.renderer.rules.list_item_open = () => {
    return `<li style="${toStyleString({
      fontFamily: fontStack,
      fontWeight,
      letterSpacing: ls,
      fontSize: `${fontSize}px`,
      lineHeight: String(lineHeight),
      color: textColor,
      marginBottom: `${listItemSpacing}em`,
    })}">`;
  };

  md.renderer.rules.list_item_close = () => "</li>";

  md.renderer.rules.bullet_list_open = () => {
    return `<ul style="${toStyleString({
      paddingLeft: `${listIndent}em`,
      marginTop: "0.4em",
      marginBottom: `${paragraphSpacing}em`,
    })}">`;
  };

  md.renderer.rules.bullet_list_close = () => "</ul>";

  md.renderer.rules.ordered_list_open = () => {
    return `<ol style="${toStyleString({
      paddingLeft: `${listIndent}em`,
      marginTop: "0.4em",
      marginBottom: `${paragraphSpacing}em`,
    })}">`;
  };

  md.renderer.rules.ordered_list_close = () => "</ol>";

  md.renderer.rules.code_inline = (tokens, idx) => {
    const content = md.utils.escapeHtml(tokens[idx].content);
    return `<code style="${toStyleString({
      backgroundColor: hexToRgba(primaryColor, 0.12),
      color: textColor,
      padding: "2px 6px",
      borderRadius: `${Math.round(borderRadius / 2)}px`,
      fontSize: `${Math.round(fontSize * 0.9)}px`,
      fontFamily:
        "Menlo, Monaco, 'Courier New', monospace",
    })}">${content}</code>`;
  };

  const codeBlockStyle = toStyleString({
    backgroundColor: "#F5F5F0",
    padding: "20px",
    borderRadius: `${borderRadius}px`,
    overflow: "auto",
    fontSize: `${Math.round(fontSize * 0.88)}px`,
    lineHeight: "1.6",
    color: textColor,
    marginTop: `${paragraphSpacing}em`,
    marginBottom: `${paragraphSpacing}em`,
  });

  const monoFont = "Menlo, Monaco, 'Courier New', monospace";

  md.renderer.rules.code_block = (tokens, idx) => {
    const content = md.utils.escapeHtml(tokens[idx].content);
    return `<pre style="${codeBlockStyle}"><code style="font-family: ${monoFont};">${content}</code></pre>`;
  };

  md.renderer.rules.fence = (tokens, idx) => {
    const content = md.utils.escapeHtml(tokens[idx].content);
    return `<pre style="${codeBlockStyle}"><code style="font-family: ${monoFont};">${content}</code></pre>`;
  };

  md.renderer.rules.link_open = (tokens, idx) => {
    const href = tokens[idx].attrGet("href") || "";
    return `<a href="${href}" style="${toStyleString({
      color: primaryColor,
      textDecoration: "underline",
    })}">`;
  };

  md.renderer.rules.link_close = () => "</a>";

  md.renderer.rules.em_open = () => "<em>";
  md.renderer.rules.em_close = () => "</em>";

  md.renderer.rules.strong_open = () => {
    switch (boldStyle) {
      case "primary-color":
        return `<strong style="color: ${primaryColor};">`;
      case "highlight":
        return `<strong style="${toStyleString({
          backgroundColor: hexToRgba(primaryColor, 0.2),
          padding: "2px 4px",
          borderRadius: "2px",
          fontWeight: "600",
        })}">`;
      case "underline":
        return `<strong style="text-decoration: underline; text-underline-offset: 4px;">`;
      default:
        return "<strong>";
    }
  };

  md.renderer.rules.strong_close = () => "</strong>";

  let tableRowIndex = 0;

  md.renderer.rules.table_open = () => {
    tableRowIndex = 0;
    return `<section style="${toStyleString({
      marginTop: `${paragraphSpacing}em`,
      marginBottom: `${paragraphSpacing}em`,
      overflowX: "auto",
      borderRadius: `${borderRadius}px`,
      border: `1px solid ${hexToRgba(textColor, 0.14)}`,
    })}"><table style="${toStyleString({
      width: "100%",
      minWidth: "100%",
      borderCollapse: "collapse",
      tableLayout: "fixed",
      fontFamily: fontStack,
      fontWeight,
      letterSpacing: ls,
      fontSize: `${Math.round(fontSize * 0.92)}px`,
      lineHeight: "1.6",
      color: textColor,
      backgroundColor,
    })}">`;
  };

  md.renderer.rules.table_close = () => "</table></section>";

  md.renderer.rules.tr_open = () => {
    const background =
      tableRowIndex % 2 === 0
        ? backgroundColor
        : hexToRgba(primaryColor, 0.045);
    tableRowIndex++;
    return `<tr style="background-color: ${background};">`;
  };

  md.renderer.rules.th_open = () => {
    return `<th style="${toStyleString({
      padding: "10px 12px",
      borderRight: `1px solid ${hexToRgba(textColor, 0.12)}`,
      borderBottom: `1px solid ${hexToRgba(textColor, 0.16)}`,
      backgroundColor: hexToRgba(primaryColor, 0.14),
      color: textColor,
      fontWeight: "700",
      textAlign: "left",
      verticalAlign: "top",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
    })}">`;
  };

  md.renderer.rules.td_open = () => {
    return `<td style="${toStyleString({
      padding: "10px 12px",
      borderRight: `1px solid ${hexToRgba(textColor, 0.1)}`,
      borderBottom: `1px solid ${hexToRgba(textColor, 0.1)}`,
      textAlign: "left",
      verticalAlign: "top",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
    })}">`;
  };

  md.renderer.rules.hr = () => {
    return `<hr style="${toStyleString({
      border: "none",
      borderTop: `1px solid ${hexToRgba(textColor, 0.1)}`,
      marginTop: `${sectionSpacing}em`,
      marginBottom: `${sectionSpacing}em`,
    })}" />`;
  };

  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const src = token.attrGet("src") || "";
    const alt = token.content;
    return `<figure style="margin: ${paragraphSpacing}em 0; text-align: center;">
      <img src="${src}" alt="${md.utils.escapeHtml(alt)}" style="max-width: 100%; border-radius: ${borderRadius}px; display: block; margin: 0 auto;" />
      ${alt ? `<figcaption style="font-size: ${Math.round(fontSize * 0.85)}px; color: ${hexToRgba(textColor, 0.5)}; margin-top: 0.6em; font-family: ${fontStack}; letter-spacing: ${ls};">${md.utils.escapeHtml(alt)}</figcaption>` : ""}
    </figure>`;
  };

  md.renderer.rules.hardbreak = () => "<br />";
  md.renderer.rules.softbreak = () => "\n";

  const html = md.render(markdown);

  return `<section style="${toStyleString({
    backgroundColor,
    padding: "32px 24px",
    fontFamily: fontStack,
    fontWeight,
    letterSpacing: ls,
    maxWidth: `${settings.contentWidth}px`,
    margin: "0 auto",
    minHeight: "100%",
  })}">${html}</section>`;
}

export function wrapExportHTML(
  bodyHTML: string,
  settings: StyleSettings
): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MD Studio Export</title>
</head>
<body style="margin: 0; background: #E8E8E0; display: flex; justify-content: center; padding: 40px 0;">
  ${bodyHTML}
</body>
</html>`;
}
