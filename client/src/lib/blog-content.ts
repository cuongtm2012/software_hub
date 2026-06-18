import DOMPurify from "dompurify";
import {
  isHtmlContent,
  markdownToHtml,
  toEditorHtml,
  normalizeAiContentForEditor,
} from "@shared/blog-content-utils";

export { isHtmlContent, markdownToHtml, toEditorHtml, normalizeAiContentForEditor };

const PURIFY_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "code",
    "pre",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
};

export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

export function getBlogContentHtml(content: string): string {
  if (isHtmlContent(content)) {
    return sanitizeBlogHtml(content);
  }
  return sanitizeBlogHtml(markdownToHtml(content));
}

export function isBlogContentEmpty(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return true;
  const text = trimmed
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return !text;
}
