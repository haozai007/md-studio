import type MarkdownIt from "markdown-it";

// The ASCII punctuation makes markdown-it accept a closing ** after Chinese
// closing punctuation. The private-use marker lets us remove it losslessly
// after inline parsing, before analysis or rendering sees the token text.
const STRONG_BOUNDARY_SENTINEL = ".\uE000";
const CHINESE_STRONG_BOUNDARY = /(\*\*[^*`\n]+?[）】》〉」』〕〗〙〛])\*\*(?=[A-Za-z0-9\u3400-\u9FFF])/g;

function repairTextSegment(value: string): string {
  return value.replace(CHINESE_STRONG_BOUNDARY, (match, content: string, offset: number) => {
    if (offset > 0 && value[offset - 1] === "\\") return match;
    return `${content}**${STRONG_BOUNDARY_SENTINEL}`;
  });
}

function repairInlineText(value: string): string {
  // Preserve ordinary inline-code spans. Fenced code is handled separately.
  return value
    .split(/(`+[^`]*?`+)/g)
    .map((segment, index) => (index % 2 === 0 ? repairTextSegment(segment) : segment))
    .join("");
}

export function repairChineseStrongBoundaries(markdown: string): string {
  let fence: string | null = null;
  return markdown
    .split(/(\r?\n)/)
    .map((part) => {
      if (/^\r?\n$/.test(part)) return part;
      const fenceMatch = part.match(/^\s*(`{3,}|~{3,})/);
      if (fenceMatch) {
        const marker = fenceMatch[1][0];
        if (!fence) fence = marker;
        else if (fence === marker) fence = null;
        return part;
      }
      if (fence || /^(?: {4}|\t)/.test(part)) return part;
      return repairInlineText(part);
    })
    .join("");
}

export function installChineseStrongCompatibility(md: MarkdownIt): void {
  md.core.ruler.after("inline", "strip_chinese_strong_boundary_sentinel", (state) => {
    const strip = (tokens: typeof state.tokens): void => {
      tokens.forEach((token) => {
        if (token.type === "text" && token.content.includes(STRONG_BOUNDARY_SENTINEL)) {
          token.content = token.content.split(STRONG_BOUNDARY_SENTINEL).join("");
        }
        if (token.children) strip(token.children);
      });
    };
    strip(state.tokens);
  });
}
