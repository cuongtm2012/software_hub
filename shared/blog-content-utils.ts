function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  return /<(p|div|h[1-6]|ul|ol|li|blockquote|strong|em|br|a|pre|code)\b/i.test(trimmed);
}

export function looksLikeAiJsonPayload(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith("{") && /"content"\s*:/i.test(trimmed);
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseMarkdownBlocks(block: string): string {
  const lines = block.split("\n");
  const parts: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      parts.push("</ul>");
      inList = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      closeList();
      parts.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      closeList();
      parts.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        parts.push("<ul>");
        inList = true;
      }
      parts.push(`<li>${escapeHtml(line.slice(2))}</li>`);
    } else if (line.startsWith("> ")) {
      closeList();
      parts.push(`<blockquote><p>${escapeHtml(line.slice(2))}</p></blockquote>`);
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      parts.push(`<p>${escapeHtml(line)}</p>`);
    }
  }

  closeList();
  return parts.join("");
}

export function markdownToHtml(content: string): string {
  if (!content.trim()) return "<p></p>";
  if (isHtmlContent(content)) return content;

  if (!content.includes("```")) {
    return parseMarkdownBlocks(content) || "<p></p>";
  }

  const parts: string[] = [];
  const segments = content.split("```");

  for (let i = 0; i < segments.length; i++) {
    if (i % 2 === 1) {
      const segment = segments[i];
      const newline = segment.indexOf("\n");
      const lang = newline > 0 ? segment.slice(0, newline).trim() : "";
      const code = newline > 0 ? segment.slice(newline + 1) : segment;
      const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      parts.push(`<pre><code${langClass}>${escapeHtml(code.trimEnd())}</code></pre>`);
      continue;
    }

    const html = parseMarkdownBlocks(segments[i]);
    if (html) parts.push(html);
  }

  return parts.join("") || "<p></p>";
}

export function toEditorHtml(content: string): string {
  return markdownToHtml(content);
}

function readJsonStringValue(text: string, startQuoteIndex: number): string {
  let pos = startQuoteIndex + 1;
  let out = "";

  while (pos < text.length) {
    const ch = text[pos];
    if (ch === "\\" && pos + 1 < text.length) {
      const next = text[pos + 1];
      if (next === "n") out += "\n";
      else if (next === "t") out += "\t";
      else if (next === "r") out += "\r";
      else if (next === '"') out += '"';
      else if (next === "\\") out += "\\";
      else out += next;
      pos += 2;
      continue;
    }
    if (ch === '"') break;
    out += ch;
    pos++;
  }

  return out;
}

export function extractJsonStringField(text: string, field: string): string | null {
  const re = new RegExp(`"${field}"\\s*:\\s*"`, "i");
  const match = re.exec(text);
  if (!match) return null;
  const quoteIndex = match.index + match[0].length - 1;
  const value = readJsonStringValue(text, quoteIndex);
  return value || null;
}

export function parseAiJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    // continue
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim()) as Record<string, unknown>;
    } catch {
      // continue
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      // continue
    }
  }

  return null;
}

export type AiRewriteFields = {
  content?: string;
  excerpt?: string;
  seo_description?: string;
  notes?: string;
};

export function parseAiRewriteResponse(aiText: string): AiRewriteFields {
  const trimmed = aiText.trim();
  const parsed = parseAiJson(trimmed);

  if (parsed) {
    return {
      content: typeof parsed.content === "string" ? parsed.content : undefined,
      excerpt: typeof parsed.excerpt === "string" ? parsed.excerpt : undefined,
      seo_description:
        typeof parsed.seo_description === "string" ? parsed.seo_description : undefined,
      notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
    };
  }

  const extracted: AiRewriteFields = {
    content: extractJsonStringField(trimmed, "content") ?? undefined,
    excerpt: extractJsonStringField(trimmed, "excerpt") ?? undefined,
    seo_description: extractJsonStringField(trimmed, "seo_description") ?? undefined,
    notes: extractJsonStringField(trimmed, "notes") ?? undefined,
  };

  if (extracted.content) return extracted;

  if (looksLikeAiJsonPayload(trimmed)) {
    throw new Error("AI trả về JSON không hợp lệ. Hãy thử lại hoặc rút ngắn nội dung.");
  }

  if (!trimmed.startsWith("{")) {
    return { content: trimmed };
  }

  throw new Error("Không đọc được phản hồi AI.");
}

export function normalizeAiContentForEditor(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "<p></p>";

  if (looksLikeAiJsonPayload(trimmed)) {
    try {
      const recovered = parseAiRewriteResponse(trimmed);
      if (recovered.content) return toEditorHtml(recovered.content);
    } catch {
      const field = extractJsonStringField(trimmed, "content");
      if (field) return toEditorHtml(field);
    }
  }

  return toEditorHtml(trimmed);
}
