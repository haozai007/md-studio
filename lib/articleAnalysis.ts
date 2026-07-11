import MarkdownIt from "markdown-it";
import {
  ArticleAnalysis,
  ArticleHeading,
  ArticleType,
  CheckIssue,
  Confidence,
  KeywordCandidate,
  ThemeRecommendation,
} from "./articleTypes";
import { ThemeName } from "./themeConfig";

const analyzer = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
});

const CONCLUSION_RE = /^(结语|总结|写在最后|最后的话|尾声|小结|结论|后记|尾记)/;
const PLACEHOLDER_RE = /\{\{[^}]+\}\}|\bTODO\b|【(?:插入|待补|补充)[^】]*】/i;

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

function countMatches(value: string, pattern: RegExp): number {
  return (value.match(pattern) || []).length;
}

function confidenceFor(top: number, second: number): Confidence {
  if (top >= 9 && top - second >= 3) return "high";
  if (top >= 6 && top - second >= 2) return "medium";
  return "low";
}

function extractIntro(markdown: string): string | null {
  const lines = markdown.split(/\r?\n/);
  let cursor = 0;
  while (cursor < lines.length && !/^#\s+/.test(lines[cursor])) cursor++;
  if (cursor < lines.length) cursor++;
  while (cursor < lines.length && !lines[cursor].trim()) cursor++;
  if (!/^>\s?/.test(lines[cursor] || "")) return null;
  const quote: string[] = [];
  while (cursor < lines.length && (/^>/.test(lines[cursor]) || !lines[cursor].trim())) {
    if (/^>/.test(lines[cursor])) quote.push(lines[cursor].replace(/^>\s?/, ""));
    cursor++;
  }
  const value = quote.join("\n").trim();
  return value || null;
}

function classify(
  markdown: string,
  title: string,
  stats: ArticleAnalysis["stats"],
  headings: ArticleHeading[],
  averageParagraphLength: number
): {
  articleType: ArticleType;
  confidence: Confidence;
  scores: Record<ArticleType, number>;
  reasons: string[];
} {
  const source = markdown.replace(/```[\s\S]*?```/g, "").replace(/https?:\/\/\S+/g, "");
  const scores: Record<ArticleType, number> = {
    tutorial: 0,
    listicle: 0,
    analysis: 0,
    essay: 0,
  };
  const reasonMap: Record<ArticleType, string[]> = {
    tutorial: [],
    listicle: [],
    analysis: [],
    essay: [],
  };

  if (/(教程|指南|步骤|操作|安装|配置|搭建|如何|怎么|实战|入门)/.test(title)) {
    scores.tutorial += 5;
    reasonMap.tutorial.push("标题具有教程或操作导向");
  }
  if (countMatches(source, /(第[一二三四五六七八九十\d]+步|首先|然后|接着|最后)/g) >= 2) {
    scores.tutorial += 3;
    reasonMap.tutorial.push("正文包含连续步骤");
  }
  if (stats.listItems >= 3) scores.tutorial += 3;
  if (stats.codeBlocks > 0) {
    scores.tutorial += 2;
    reasonMap.tutorial.push("包含代码或命令示例");
  }
  if (countMatches(source, /(点击|输入|执行|运行|安装|设置|创建|复制)/g) >= 3) scores.tutorial += 2;

  if (/(清单|盘点|合集|推荐|工具|书单|资源|必备|值得|\d+[个款种类])/.test(title)) {
    scores.listicle += 5;
    reasonMap.listicle.push("标题呈现清单或盘点特征");
  }
  if (stats.listItems >= 5) {
    scores.listicle += 4;
    reasonMap.listicle.push("并列条目较多");
  }
  if (headings.filter((item) => item.level === 2).length >= 4) scores.listicle += 3;
  if (headings.filter((item) => /^\d+[.、]|^[一二三四五六七八九十]+[、.]/.test(item.text)).length >= 2) {
    scores.listicle += 3;
  }

  if (/(为什么|本质|趋势|影响|逻辑|判断|思考|分析|观点|洞察|原因)/.test(title)) {
    scores.analysis += 4;
    reasonMap.analysis.push("标题偏向观点或分析");
  }
  const logicWords = countMatches(source, /(因为|因此|但是|然而|这意味着|核心是|关键在于)/g);
  if (logicWords >= 4) {
    scores.analysis += logicWords >= 8 ? 6 : 4;
    reasonMap.analysis.push("论证和因果连接较密集");
  }
  if (averageParagraphLength >= 80) scores.analysis += 2;
  if (stats.tables > 0 || countMatches(source, /\d+(?:\.\d+)?%/g) >= 2) scores.analysis += 2;
  if (headings.some((item) => /(问题|原因|结论)/.test(item.text))) scores.analysis += 3;

  if (/(随笔|故事|生活|感受|记忆|那年|写给|独白)/.test(title)) {
    scores.essay += 4;
    reasonMap.essay.push("标题具有叙事或随笔气质");
  }
  if (countMatches(source, /(我|我们)/g) >= 5 && /(那天|后来|曾经|记得|当时|朋友|回家|夜晚)/.test(source)) {
    scores.essay += 3;
    reasonMap.essay.push("第一人称叙事明显");
  }
  if (countMatches(source, /(那天|后来|曾经|记得|当时|朋友|回家|夜晚)/g) >= 3) scores.essay += 3;
  if (stats.quotes >= 2) scores.essay += 2;
  if (stats.listItems === 0 && stats.codeBlocks === 0 && stats.tables === 0) scores.essay += 2;
  if (stats.codeBlocks >= 2 || stats.listItems >= 6) scores.essay -= 4;

  const ranked = (Object.entries(scores) as [ArticleType, number][]).sort((a, b) => b[1] - a[1]);
  const articleType = ranked[0][1] < 5 ? "analysis" : ranked[0][0];
  return {
    articleType,
    confidence: confidenceFor(ranked[0][1], ranked[1][1]),
    scores,
    reasons:
      ranked[0][1] < 5
        ? ["当前文本特征较少，暂按通用观点文章处理"]
        : reasonMap[articleType].slice(0, 3),
  };
}

function recommendTheme(
  articleType: ArticleType,
  stats: ArticleAnalysis["stats"],
  markdown: string
): ThemeRecommendation {
  const matrix: Record<ArticleType, Record<ThemeName, number>> = {
    tutorial: { "ai-project": 86, "supo-minimal": 72, "design-case": 58, "light-note-blue": 48 },
    listicle: { "supo-minimal": 88, "ai-project": 74, "design-case": 64, "light-note-blue": 56 },
    analysis: { "design-case": 86, "light-note-blue": 72, "supo-minimal": 70, "ai-project": 66 },
    essay: { "light-note-blue": 92, "design-case": 70, "supo-minimal": 58, "ai-project": 35 },
  };
  const scores = { ...matrix[articleType] };
  const reasons: Partial<Record<ThemeName, string[]>> = {};
  const add = (theme: ThemeName, score: number, reason: string) => {
    scores[theme] = Math.min(100, scores[theme] + score);
    reasons[theme] = [...(reasons[theme] || []), reason];
  };
  if (stats.codeBlocks > 0) add("ai-project", Math.min(12, stats.codeBlocks * 4), "包含代码或命令");
  if (stats.tables > 0 || countMatches(markdown, /\d+(?:\.\d+)?%/g) >= 4) {
    add("ai-project", 8, "包含数据或表格");
    add("design-case", 4, "适合信息对比");
  }
  if (stats.images >= 3) add("design-case", 8, "图片内容较丰富");
  if (stats.quotes >= 2) add("light-note-blue", 7, "引用与叙述较多");
  if (stats.sections >= 5 || stats.listItems >= 8) add("supo-minimal", 8, "信息密度较高");
  if (/(设计|案例|复盘|品牌|视觉)/.test(markdown.slice(0, 300))) add("design-case", 12, "主题偏设计或案例复盘");
  if (/(AI|API|模型|代码|开发)/i.test(markdown)) add("ai-project", 8, "主题偏科技与开发");

  const ranked = (Object.entries(scores) as [ThemeName, number][]).sort((a, b) => b[1] - a[1]);
  const gap = ranked[0][1] - ranked[1][1];
  return {
    theme: ranked[0][0],
    score: ranked[0][1],
    confidence: gap >= 15 ? "high" : gap >= 7 ? "medium" : "low",
    reasons: reasons[ranked[0][0]]?.slice(0, 2) || ["与当前文章类型的排版气质最匹配"],
  };
}

function keywordSuggestions(
  paragraphs: { text: string; line: number; strong: string[] }[]
): KeywordCandidate[] {
  const result: KeywordCandidate[] = [];
  const seen = new Set<string>();
  const add = (
    phrase: string,
    paragraphIndex: number,
    line: number,
    score: number,
    reason: string
  ) => {
    const clean = phrase.replace(/^[，。！？：；、\s]+|[，。！？：；、\s]+$/g, "").trim();
    if (clean.length < 2 || clean.length > 24) return;
    const key = `${paragraphIndex}:${clean}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push({
      id: `kw-${hash(`${line}:${clean}`)}`,
      phrase: clean,
      paragraphIndex,
      line,
      score,
      reason,
    });
  };

  paragraphs.forEach((paragraph, index) => {
    paragraph.strong.slice(0, 2).forEach((value) => add(value, index, paragraph.line, 95, "原文已加粗"));
    const quoteMatches = paragraph.text.match(/[“「『]([^”」』]{4,15})[”」』]/g) || [];
    quoteMatches.slice(0, 2).forEach((value) => add(value.slice(1, -1), index, paragraph.line, 90, "核心引语"));
    const data = paragraph.text.match(/[一-\u9fffA-Za-z]{0,6}\d+(?:\.\d+)?%?[一-\u9fffA-Za-z]{0,6}/g) || [];
    data.filter((value) => value.length >= 4).slice(0, 1).forEach((value) => add(value, index, paragraph.line, 85, "关键数据"));
    const semantic = paragraph.text.match(/(?:核心|关键|本质|重点|结论|原因|优势|目标|方法)(?:是|在于|包括|：)?([^，。！？；]{4,15})/);
    if (semantic) add(semantic[1], index, paragraph.line, 80, "核心语义");
    const proper = paragraph.text.match(/\b(?:[A-Z][A-Za-z0-9.+-]{2,}|AI|API|LLM|ChatGPT|Codex)\b/g) || [];
    proper.slice(0, 1).forEach((value) => add(value, index, paragraph.line, 75, "产品或专有名词"));
  });

  return result
    .sort((a, b) => b.score - a.score || a.line - b.line)
    .filter((candidate, index, all) => {
      return all.slice(0, index).filter((item) => item.paragraphIndex === candidate.paragraphIndex).length < 3;
    })
    .slice(0, 60);
}

function qualityChecks(
  markdown: string,
  headings: ArticleHeading[],
  paragraphs: { text: string; line: number; strong: string[] }[],
  stats: ArticleAnalysis["stats"]
): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const add = (code: string, severity: "warning" | "info", message: string, suggestion?: string, line?: number) => {
    issues.push({ id: `${code}-${line || 0}`, category: "quality", severity, message, suggestion, line });
  };
  const h1 = headings.filter((item) => item.level === 1);
  if (h1.length === 0) add("missing-title", "info", "文章没有一级标题", "建议增加一个 # 文章标题");
  if (h1.length > 1) add("multiple-title", "warning", "文章包含多个一级标题", "仅保留一个文章主标题", h1[1].line);
  for (let index = 1; index < headings.length; index++) {
    if (headings[index].level - headings[index - 1].level > 1) {
      add("heading-jump", "warning", `标题层级从 H${headings[index - 1].level} 跳到 H${headings[index].level}`, "补齐中间标题层级", headings[index].line);
    }
  }
  if (stats.characters > 800 && stats.sections === 0) add("no-sections", "warning", "长文没有二级章节", "用 ## 将正文拆成易读章节");
  paragraphs.forEach((paragraph) => {
    if (paragraph.text.length > 220) add("long-paragraph", "warning", `第 ${paragraph.line} 行段落超过 220 字`, "拆分为两个或更多段落", paragraph.line);
    else if (paragraph.text.length > 140) add("dense-paragraph", "info", `第 ${paragraph.line} 行段落较长`, "可适当拆段改善移动端阅读", paragraph.line);
    if (paragraph.strong.length >= 3) add("heavy-emphasis", "warning", `第 ${paragraph.line} 行强强调较多`, "每段保留 1–2 个重点", paragraph.line);
  });
  const strongChars = paragraphs.flatMap((item) => item.strong).join("").length;
  if (strongChars > stats.characters * 0.12 && strongChars > 30) add("emphasis-ratio", "warning", "全文强调比例超过 12%", "减少加粗，让视觉锚点更集中");
  const emptyAlt = markdown.split(/\r?\n/).findIndex((line) => /!\[\]\([^)]+\)/.test(line));
  if (emptyAlt >= 0) add("image-alt", "info", "存在没有说明文字的图片", "需要说明时补充图片 alt 文本", emptyAlt + 1);
  if (PLACEHOLDER_RE.test(markdown)) add("placeholder", "warning", "正文中仍有待补内容或占位符", "发布前补齐素材或删除占位");
  const wideTableLine = markdown.split(/\r?\n/).findIndex((line) => (line.match(/\|/g) || []).length > 5);
  if (wideTableLine >= 0) add("wide-table", "warning", "表格超过 4 列，手机端可能拥挤", "精简列数或改为纵向卡片", wideTableLine + 1);
  return issues;
}

export function analyzeArticle(markdown: string): ArticleAnalysis {
  const tokens = analyzer.parse(markdown, {});
  const headings: ArticleHeading[] = [];
  const paragraphs: { text: string; line: number; strong: string[] }[] = [];
  let listItems = 0;
  let codeBlocks = 0;
  let images = 0;
  let tables = 0;
  let quotes = 0;
  let quoteDepth = 0;

  tokens.forEach((token, index) => {
    if (token.type === "blockquote_open") {
      quotes++;
      quoteDepth++;
    }
    if (token.type === "blockquote_close") quoteDepth = Math.max(0, quoteDepth - 1);
    if (token.type === "list_item_open") listItems++;
    if (token.type === "fence" || token.type === "code_block") codeBlocks++;
    if (token.type === "table_open") tables++;
    if (token.type === "heading_open") {
      const level = Number(token.tag.slice(1));
      const text = tokens[index + 1]?.content?.trim() || "";
      const line = (token.map?.[0] || 0) + 1;
      headings.push({
        id: `heading-${hash(`${level}:${line}:${text}`)}`,
        level,
        text,
        line,
        isConclusion: level === 2 && CONCLUSION_RE.test(text),
      });
    }
    if (token.type === "inline") {
      const children = token.children || [];
      images += children.filter((child) => child.type === "image").length;
      const isParagraph = tokens[index - 1]?.type === "paragraph_open";
      if (isParagraph) {
        const strong: string[] = [];
        let inStrong = false;
        children.forEach((child) => {
          if (child.type === "strong_open") inStrong = true;
          else if (child.type === "strong_close") inStrong = false;
          else if (inStrong && child.type === "text") strong.push(child.content.trim());
        });
        const text = token.content.replace(/!\[[^\]]*\]\([^)]+\)/g, "").trim();
        if (text && quoteDepth === 0) {
          paragraphs.push({ text, line: (token.map?.[0] || 0) + 1, strong: strong.filter(Boolean) });
        }
      }
    }
  });

  const title = headings.find((item) => item.level === 1)?.text || "";
  const sections = headings.filter((item) => item.level === 2);
  const stats = {
    characters: markdown.replace(/\s+/g, "").length,
    paragraphs: paragraphs.length,
    sections: sections.length,
    listItems,
    codeBlocks,
    images,
    tables,
    quotes,
  };
  const averageParagraphLength = paragraphs.length
    ? paragraphs.reduce((sum, item) => sum + item.text.length, 0) / paragraphs.length
    : 0;
  const classification = classify(markdown, title, stats, headings, averageParagraphLength);
  const recommendation = recommendTheme(classification.articleType, stats, markdown);

  const tocCandidates = sections
    .filter((item) => !item.isConclusion && !/^(前言|其他|补充)$/.test(item.text))
    .map((item, index) => {
      const nextLine = sections[index + 1]?.line || markdown.split(/\r?\n/).length + 1;
      const sectionText = markdown.split(/\r?\n/).slice(item.line, nextLine - 1).join("");
      let score = sectionText.length >= 200 ? 3 : 0;
      if (/```|!\[|^[-*+]\s|^\d+[.)]\s/m.test(sectionText)) score += 2;
      if (item.text.length >= 4 && item.text.length <= 18) score += 2;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item }) => item)
    .sort((a, b) => a.line - b.line);

  return {
    title,
    intro: extractIntro(markdown),
    headings,
    toc: tocCandidates,
    articleType: classification.articleType,
    confidence: classification.confidence,
    classificationScores: classification.scores,
    classificationReasons: classification.reasons,
    recommendation,
    keywordCandidates: keywordSuggestions(paragraphs),
    qualityIssues: qualityChecks(markdown, headings, paragraphs, stats),
    stats,
  };
}
