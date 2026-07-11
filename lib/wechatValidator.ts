import { CheckIssue } from "./articleTypes";

export interface ValidationReport {
  valid: boolean;
  issues: CheckIssue[];
  errors: CheckIssue[];
  warnings: CheckIssue[];
  stats: {
    leafCount: number;
    textNodeCount: number;
    imageCount: number;
  };
}

const ALLOWED_TAGS = new Set(["section", "p", "span", "strong", "a", "img", "br"]);
const VOID_TAGS = new Set(["img", "br"]);
const ATTRIBUTES: Record<string, Set<string>> = {
  section: new Set(["style"]),
  p: new Set(["style"]),
  span: new Set(["style", "leaf"]),
  strong: new Set(["style"]),
  a: new Set(["style", "href"]),
  img: new Set(["style", "src", "alt"]),
  br: new Set([]),
};

const FORBIDDEN_STYLE: { pattern: RegExp; message: string }[] = [
  { pattern: /position\s*:\s*(fixed|absolute|sticky)/i, message: "position fixed/absolute/sticky 不受公众号支持" },
  { pattern: /float\s*:/i, message: "float 不受公众号支持" },
  { pattern: /display\s*:\s*grid/i, message: "display:grid 不受公众号支持" },
  { pattern: /@(media|keyframes|import)/i, message: "媒体查询、动画或 @import 不受公众号支持" },
  { pattern: /var\s*\(\s*--/i, message: "CSS 变量会在粘贴后失效" },
  { pattern: /(expression\s*\(|behavior\s*:|-moz-binding)/i, message: "发现危险 CSS 表达式" },
  { pattern: /url\s*\(/i, message: "内联样式中的 url() 已禁用" },
];

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, "\u00a0")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function parseAttributes(source: string): { name: string; value: string }[] {
  const attributes: { name: string; value: string }[] = [];
  const body = source.replace(/^<\/?\s*[\w-]+|\/?>$/g, "");
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body))) {
    attributes.push({ name: match[1].toLowerCase(), value: match[2] ?? match[3] ?? match[4] ?? "" });
  }
  return attributes;
}

function unsafeURL(value: string, tag: "a" | "img"): boolean {
  const compact = decodeBasicEntities(value).replace(/[\u0000-\u0020]+/g, "").toLowerCase();
  if (!compact) return tag === "img";
  if (/^(javascript|vbscript|file):/.test(compact)) return true;
  if (compact.startsWith("data:")) {
    return tag !== "img" || !/^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(compact);
  }
  if (/^[a-z][a-z0-9+.-]*:/.test(compact)) {
    return tag === "img" ? !/^https?:/.test(compact) : !/^(https?|mailto):/.test(compact);
  }
  return false;
}

export function validateWechatHTML(html: string): ValidationReport {
  const issues: CheckIssue[] = [];
  const seen = new Set<string>();
  const add = (code: string, severity: "error" | "warning" | "info", message: string, suggestion?: string) => {
    const key = `${code}:${message}`;
    if (seen.has(key)) return;
    seen.add(key);
    issues.push({ id: `compat-${issues.length + 1}`, category: "compatibility", severity, message, suggestion });
  };

  if (/<!doctype|<\/?(?:html|head|body)\b/i.test(html)) {
    add("document-shell", "error", "复制内容包含完整 HTML 文档外壳", "仅输出正文 section 片段");
  }
  if (/<(?:style|script|link|div)\b/i.test(html)) {
    add("forbidden-tag", "error", "发现公众号会过滤的标签", "改用 section 和内联样式");
  }

  const stack: { tag: string; leaf: boolean; code: boolean }[] = [];
  let leafDepth = 0;
  let codeDepth = 0;
  let leafCount = 0;
  let textNodeCount = 0;
  let imageCount = 0;
  const stream = /<!--[\s\S]*?-->|<[^>]+>|[^<]+/g;
  let token: RegExpExecArray | null;

  while ((token = stream.exec(html))) {
    const value = token[0];
    if (value.startsWith("<!--")) continue;
    if (value.startsWith("<")) {
      const end = /^<\s*\/\s*([\w-]+)/.exec(value);
      if (end) {
        const tag = end[1].toLowerCase();
        for (let index = stack.length - 1; index >= 0; index--) {
          if (stack[index].tag === tag) {
            const removed = stack.splice(index);
            removed.forEach((entry) => {
              if (entry.leaf) leafDepth--;
              if (entry.code) codeDepth--;
            });
            break;
          }
        }
        continue;
      }
      const start = /^<\s*([\w-]+)/.exec(value);
      if (!start) continue;
      const tag = start[1].toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        add(`tag-${tag}`, "error", `标签 <${tag}> 不在公众号输出白名单中`, "使用 section、p、span 或 img 组件");
      }
      const attributes = parseAttributes(value);
      attributes.forEach(({ name, value: attributeValue }) => {
        if (name.startsWith("on") || name === "class" || name === "id" || name === "contenteditable" || name === "srcset") {
          add(`attribute-${name}`, "error", `属性 ${name} 不安全或会被公众号移除`);
        } else if (ALLOWED_TAGS.has(tag) && !ATTRIBUTES[tag]?.has(name)) {
          add(`attribute-${tag}-${name}`, "error", `<${tag}> 使用了非白名单属性 ${name}`);
        }
        if (name === "style") {
          FORBIDDEN_STYLE.forEach(({ pattern, message }) => {
            if (pattern.test(attributeValue)) add("forbidden-css", "error", message);
          });
        }
        if ((name === "href" && tag === "a") || (name === "src" && tag === "img")) {
          if (unsafeURL(attributeValue, tag as "a" | "img")) {
            add("unsafe-url", "error", `发现不安全的 ${name} 地址`, "仅使用 HTTPS/HTTP 安全地址");
          } else if (/^http:/i.test(attributeValue)) {
            add("http-url", "warning", "存在 HTTP 资源，公众号中可能加载失败", "改用 HTTPS 地址");
          } else if (!/^[a-z][a-z0-9+.-]*:/i.test(attributeValue) && !attributeValue.startsWith("data:")) {
            add("relative-url", "warning", "存在相对资源地址，发布后可能失效", "上传图片并替换为可访问的 HTTPS 地址");
          }
        }
      });
      if (tag === "img") {
        imageCount++;
        const style = attributes.find((item) => item.name === "style")?.value || "";
        if (!/max-width\s*:\s*100%/i.test(style) || !/height\s*:\s*auto/i.test(style) || !/display\s*:\s*block/i.test(style) || !/margin\s*:\s*0\s+auto/i.test(style)) {
          add("image-layout", "warning", "图片缺少完整的移动端自适应样式", "使用 max-width:100%;height:auto;display:block;margin:0 auto");
        }
      }
      const isLeaf = tag === "span" && attributes.some((item) => item.name === "leaf");
      const isCode = attributes.some((item) => item.name === "style" && /monospace|consolas|courier/i.test(item.value));
      if (isLeaf) {
        leafDepth++;
        leafCount++;
      }
      if (isCode) codeDepth++;
      if (!VOID_TAGS.has(tag) && !/\/>$/.test(value)) stack.push({ tag, leaf: isLeaf, code: isCode });
      else {
        if (isLeaf) leafDepth--;
        if (isCode) codeDepth--;
      }
      continue;
    }

    const text = decodeBasicEntities(value).trim();
    if (!text) continue;
    textNodeCount++;
    if (leafDepth === 0) add("unwrapped-text", "error", `存在未被 <span leaf> 包裹的文字：“${text.slice(0, 24)}”`, "所有文字节点都需要 leaf 包裹");
    if (codeDepth === 0 && /[一-\u9fff][,;!?]/.test(text)) {
      add("half-punctuation", "warning", "正文中存在中文后的半角标点", "改为中文全角标点");
    }
  }

  if (textNodeCount > 0 && leafCount === 0) add("no-leaf", "error", "全文没有 <span leaf> 文字包裹");
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    valid: errors.length === 0,
    issues,
    errors,
    warnings,
    stats: { leafCount, textNodeCount, imageCount },
  };
}
