import { escapeAttribute, hexToRgba, leaf, safeURL, toStyleString } from "../htmlUtils";
import type { ThemeModules, ThemeRenderers } from "./types";

const option = (m: ThemeModules, part: keyof ThemeModules, key: string, fallback: string | number | boolean) =>
  m[part].options[key] ?? fallback;

export function createConfiguredRenderers(m: ThemeModules): Partial<ThemeRenderers> {
  return {
    articleTitle(title, { settings: s, fontStack: font }) {
      if (!title) return "";
      const variant = m.articleTitle.variant;
      const tech = variant === "tech-hero";
      const magazine = variant === "magazine-cover";
      const align = String(option(m, "articleTitle", "align", "left"));
      const eyebrow = String(option(m, "articleTitle", "eyebrow", "ARTICLE"));
      const badge = String(option(m, "articleTitle", "badge", ""));
      return `<section style="${toStyleString({ margin: "0 0 28px", padding: tech ? "20px" : magazine ? "8px 0 22px" : "0 0 20px", textAlign: align, backgroundColor: tech ? hexToRgba(s.primaryColor, .07) : undefined, border: tech ? `1px solid ${hexToRgba(s.primaryColor, .22)}` : undefined, borderBottom: !tech ? `${magazine ? 3 : 1}px solid ${s.primaryColor}` : undefined, borderRadius: tech ? `${s.borderRadius}px` : undefined })}"><p style="margin:0 0 10px;color:${s.primaryColor};font-family:${font};font-size:11px;font-weight:700;letter-spacing:${magazine ? 3 : 2}px;">${leaf(eyebrow)}${badge ? leaf(`  ${badge}`) : ""}</p><p style="margin:0;color:${s.textColor};font-family:${font};font-size:${s.headingFontSize + (magazine ? 4 : 0)}px;font-weight:700;line-height:1.3;letter-spacing:${s.letterSpacing}px;">${leaf(title)}</p></section>`;
    },
    intro(intro, { settings: s, fontStack: font }) {
      if (!intro) return "";
      const airy = m.intro.variant === "airy-note";
      const terminal = m.intro.variant === "terminal-card";
      const label = String(option(m, "intro", "label", "导读"));
      const marker = String(option(m, "intro", "marker", "•"));
      const padding = Number(option(m, "intro", "padding", 18));
      const lines = intro.split(/\n+/).filter(Boolean).map((line) => `<p style="margin:0 0 6px;color:${s.textColor};font-family:${font};font-size:${Math.max(14, s.fontSize)}px;line-height:1.8;">${leaf(line)}</p>`).join("");
      return `<section style="${toStyleString({ margin: "0 0 28px", padding: `${padding}px`, backgroundColor: airy ? "transparent" : hexToRgba(s.primaryColor, terminal ? .08 : .055), border: airy ? undefined : `1px solid ${hexToRgba(s.primaryColor, .18)}`, borderLeft: airy ? `2px solid ${s.primaryColor}` : terminal ? `5px solid ${s.primaryColor}` : undefined, borderRadius: airy ? "0" : `${s.borderRadius}px` })}"><p style="margin:0 0 10px;color:${s.primaryColor};font-family:${font};font-size:11px;font-weight:700;letter-spacing:2px;">${leaf(`${marker} ${label}`)}</p>${lines}</section>`;
    },
    toc(headings, { settings: s, fontStack: font }) {
      if (!headings.length) return "";
      const quiet = m.toc.variant === "quiet-index";
      const label = String(option(m, "toc", "label", "CONTENTS"));
      const limit = Number(option(m, "toc", "maxItems", 4));
      const items = headings.slice(0, limit).map((h, i) => `<section style="display:flex;align-items:baseline;margin:0 0 9px;"><span style="min-width:34px;color:${s.primaryColor};font-family:${font};font-size:11px;font-weight:700;">${leaf(String(i + 1).padStart(2, "0"))}</span><span style="color:${s.textColor};font-family:${font};font-size:${Math.max(13, s.fontSize - 1)}px;line-height:1.6;">${leaf(h.text)}</span></section>`).join("");
      return `<section style="${toStyleString({ margin: "0 0 30px", padding: quiet ? "16px 2px" : "18px 20px", backgroundColor: quiet ? "transparent" : hexToRgba(s.primaryColor, .045), borderTop: `1px solid ${hexToRgba(s.primaryColor, .25)}`, borderBottom: `1px solid ${hexToRgba(s.primaryColor, .25)}` })}"><p style="margin:0 0 14px;color:${s.primaryColor};font-family:${font};font-size:11px;font-weight:700;letter-spacing:2px;">${leaf(label)}</p>${items}</section>`;
    },
    headingOpen(input, { settings: s, fontStack: font }) {
      if (!input.isH2) return `<section style="margin:${input.tag === "h1" ? "0" : `${s.sectionSpacing}em`} 0 .75em;"><p style="margin:0;font-family:${font};font-size:${input.size}px;font-weight:700;color:${s.textColor};line-height:1.4;">`;
      const variant = m.h2.variant;
      const centered = variant === "center-underline" || variant === "magazine-divider";
      const chip = variant === "number-chip";
      return `<section style="${toStyleString({ margin: `${s.sectionSpacing}em 0 .8em`, padding: chip ? "10px 12px" : centered ? "12px 0" : "2px 0 2px 14px", textAlign: centered ? "center" : "left", backgroundColor: chip ? hexToRgba(s.primaryColor, .08) : undefined, borderLeft: !centered && !chip ? `5px solid ${s.primaryColor}` : undefined, borderTop: variant === "magazine-divider" ? `1px solid ${hexToRgba(s.textColor, .18)}` : undefined, borderBottom: centered ? `1px solid ${hexToRgba(s.primaryColor, .3)}` : undefined, borderRadius: chip ? `${s.borderRadius}px` : undefined })}"><p style="margin:0;font-family:${font};font-size:${input.size}px;font-weight:700;color:${s.textColor};line-height:1.4;letter-spacing:${s.letterSpacing}px;">${variant === "center-underline" ? "" : input.prefix}`;
    },
    headingClose() { return "</p></section>"; },
    blockquoteOpen({ settings: s, fontStack: font }) {
      const variant = m.blockquote.variant;
      const pull = variant === "pull-quote";
      const mark = String(option(m, "blockquote", "quoteMark", "“"));
      return `<section style="${toStyleString({ margin: `0 0 ${s.paragraphSpacing}em`, padding: pull ? "22px 12px" : "18px 20px", backgroundColor: variant === "minimal-quote" || pull ? "transparent" : hexToRgba(s.primaryColor, .065), borderLeft: pull ? undefined : `4px solid ${s.primaryColor}`, borderTop: pull ? `2px solid ${s.primaryColor}` : undefined, borderBottom: pull ? `1px solid ${hexToRgba(s.textColor, .16)}` : undefined, borderRadius: pull ? "0" : `${s.borderRadius}px` })}"><p style="margin:0 0 4px;color:${s.primaryColor};font-family:${font};font-size:${pull ? 30 : 20}px;font-weight:700;line-height:1;">${leaf(mark)}</p>`;
    },
    blockquoteClose() { return "</section>"; },
    image(source, alt, { settings: s, fontStack: font }) {
      const url = safeURL(source, "image");
      if (!url) return `<section style="padding:18px;border-left:4px solid ${s.primaryColor};">${leaf("图片地址不安全，已阻止加载")}</section>`;
      const padding = Number(option(m, "image", "padding", 5));
      const prefix = String(option(m, "image", "captionPrefix", ""));
      const gallery = m.image.variant === "gallery-frame";
      const caption = alt ? `<p style="margin:8px 0 22px;text-align:${gallery ? "left" : "center"};color:${hexToRgba(s.textColor, .58)};font-family:${font};font-size:12px;line-height:1.6;letter-spacing:${gallery ? 1 : 0}px;">${leaf(`${prefix ? `${prefix} — ` : ""}${alt}`)}</p>` : "";
      return `<section style="${toStyleString({ margin: alt ? "0 0 5px" : "0 0 20px", padding: `${padding}px`, backgroundColor: "#FFFFFF", border: m.image.variant === "soft-photo" ? "none" : `1px solid ${hexToRgba(s.textColor, .13)}`, borderRadius: `${s.borderRadius}px`, boxShadow: m.image.variant === "screen-frame" ? `0 6px 20px ${hexToRgba(s.primaryColor, .12)}` : undefined })}"><span leaf=""><img src="${escapeAttribute(url)}" alt="${escapeAttribute(alt)}" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:${Math.max(0, s.borderRadius - 2)}px;"></span></section>${caption}`;
    },
    signature(authorName, authorBio, { settings: s, fontStack: font }) {
      const name = authorName.trim() || "{{作者名}}";
      const bio = authorBio.trim() || "{{一句话简介}}";
      const label = String(option(m, "signature", "label", "ABOUT"));
      const letter = m.signature.variant === "letter-signoff";
      return `<section style="${toStyleString({ margin: "38px 0 0", padding: letter ? "22px 4px" : "20px", backgroundColor: letter ? "transparent" : hexToRgba(s.primaryColor, .05), borderTop: `2px solid ${s.primaryColor}`, borderRadius: letter ? "0" : `${s.borderRadius}px` })}"><p style="margin:0 0 10px;color:${s.primaryColor};font-family:${font};font-size:11px;font-weight:700;letter-spacing:2px;">${leaf(label)}</p><p style="margin:0 0 7px;color:${s.textColor};font-family:${font};font-size:${Math.max(13, s.fontSize - 1)}px;line-height:1.75;">${leaf(`我是 ${name}，${bio}`)}</p><p style="margin:0;color:${s.textColor};font-family:${font};font-size:${Math.max(13, s.fontSize - 1)}px;line-height:1.75;">${leaf("如果你觉得今天这篇有收获，欢迎点赞、在看、转发，我们下篇见。")}</p></section>`;
    },
  };
}
