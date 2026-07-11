export function escapeHTML(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttribute(value: string): string {
  return escapeHTML(value).replace(/`/g, "&#96;");
}

export function leaf(value: string, style = ""): string {
  const styleAttribute = style ? ` style="${escapeAttribute(style)}"` : "";
  return `<span leaf=""${styleAttribute}>${escapeHTML(value)}</span>`;
}

export function toStyleString(
  styles: Record<string, string | number | undefined>
): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(
      ([key, value]) =>
        `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}:${String(value)}`
    )
    .join(";");
}

export function hexToRgba(hex: string, alpha: number): string {
  const safe = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#333333";
  const r = parseInt(safe.slice(1, 3), 16);
  const g = parseInt(safe.slice(3, 5), 16);
  const b = parseInt(safe.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function safeURL(value: string, kind: "link" | "image"): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(\/|\.\/|\.\.\/)/.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return trimmed;
    }
    if (
      kind === "image" &&
      parsed.protocol === "data:" &&
      /^data:image\/(?:png|jpeg|jpg|gif|webp);base64,/i.test(trimmed)
    ) {
      return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}

export function normalizeChinesePunctuation(value: string): string {
  if (!/[一-\u9fff]/.test(value)) return value;
  return value
    .replace(/([一-\u9fff])\s*,\s*/g, "$1，")
    .replace(/([一-\u9fff])\s*;\s*/g, "$1；")
    .replace(/([一-\u9fff])\s*!/g, "$1！")
    .replace(/([一-\u9fff])\s*\?/g, "$1？")
    .replace(/([一-\u9fff])\s*:\s*(?=[一-\u9fff])/g, "$1：");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
