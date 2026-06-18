import { slugify } from "../../server/lib/slug";

const TAG_RE = /<[^>]*>/g;
const SCRIPT_STYLE_RE = /<(script|style)[^>]*>[\s\S]*?<\/\1>/gi;

export function stripHtml(input: string): string {
  return input.replaceAll(TAG_RE, " ").replace(/\s+/g, " ").trim();
}

/**
 * Best-effort HTML -> readable plain text while keeping paragraph breaks.
 * Not a full HTML-to-Markdown converter; designed for RSS snippets.
 */
export function htmlToText(input: string): string {
  return input
    .replaceAll(SCRIPT_STYLE_RE, " ")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote)>/gi, "\n")
    .replace(/<(br)\s*\/?>/gi, "\n")
    .replaceAll(TAG_RE, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function clampText(input: string, maxChars: number): string {
  const s = input.trim();
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

export function toBlogSlug(title: string): string {
  return slugify(title);
}

export function buildAttributionBlock(args: {
  sourceName: string;
  sourceUrl: string;
  originalTitle?: string;
}): string {
  const label = args.originalTitle?.trim() || "Bài gốc";
  return `\n\n---\n\n> Original: [${label}](${args.sourceUrl}) — Nguồn: ${args.sourceName}\n`;
}

export function normalizeTags(tags: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of tags) {
    const s = t.trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out.slice(0, 20);
}

