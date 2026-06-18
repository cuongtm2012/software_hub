import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { hasRole } from "../middleware/auth.middleware";
import { aiRewriteRateLimiter } from "../middleware/rate-limit";
import { deepseekChatCompletion, isDeepseekConfigured } from "../lib/deepseek";
import {
  htmlToPlainText,
  isHtmlContent,
  parseAiRewriteResponse,
  toEditorHtml,
} from "@shared/blog-content-utils";

const router = Router();

function clampText(input: string, maxChars: number): string {
  const s = String(input ?? "").trim();
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function splitAttribution(content: string): { body: string; attribution: string } {
  const marker = "\n\n---\n\n> Original:";
  const idx = content.indexOf(marker);
  if (idx === -1) return { body: content, attribution: "" };
  return { body: content.slice(0, idx).trimEnd(), attribution: content.slice(idx).trim() };
}

function prepareContentForAi(content: string): string {
  const raw = String(content ?? "").trim();
  if (!raw) return "";
  return isHtmlContent(raw) ? htmlToPlainText(raw) : raw;
}

router.get("/admin/all", hasRole(["admin"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, limit = "50", offset = "0" } = req.query;
    const result = await storage.getBlogPosts({
      tag: tag as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      publishedOnly: false,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/admin/ai-rewrite",
  hasRole(["admin"]),
  aiRewriteRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        content,
        excerpt,
        seo_description,
        tags,
        prompt,
        preset,
        keepAttribution = true,
      } = req.body ?? {};

      if (!title || typeof title !== "string") {
        return res.status(400).json({ message: "title is required" });
      }
      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "content is required" });
      }
      if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
        return res.status(400).json({ message: "prompt is required" });
      }

      if (!isDeepseekConfigured()) {
        return res.status(503).json({
          message: "DeepSeek chưa được cấu hình. Thêm DEEPSEEK_API_KEY vào file .env rồi restart server.",
        });
      }

      const allowedPresets = new Set([
        "seo_vi",
        "summarize",
        "normalize_markdown",
        "translate_en_vi",
      ]);
      const presetValue = typeof preset === "string" && allowedPresets.has(preset) ? preset : "seo_vi";

      const raw = String(content);
      const normalizedRaw = prepareContentForAi(raw);
      const { body: rawBody, attribution } = keepAttribution
        ? splitAttribution(normalizedRaw)
        : { body: normalizedRaw, attribution: "" };

      const system = [
        "Bạn là trợ lý biên tập nội dung cho blog IT.",
        "Yêu cầu bắt buộc:",
        "- Không bịa facts, không thêm số liệu/claim không có trong raw content.",
        "- Giữ đúng ý chính; có thể diễn giải rõ ràng hơn.",
        "- Trường content trong JSON phải là HTML hợp lệ (p, h2, h3, ul, ol, li, blockquote, strong, em, a). Không dùng markdown.",
        "- Không xóa link gốc; KHÔNG chỉnh sửa phần attribution (nếu có).",
        "- Trả về JSON hợp lệ duy nhất (không thêm text ngoài JSON). Escape đúng ký tự đặc biệt trong chuỗi JSON.",
      ].join("\n");

      const presetInstructions: Record<string, string> = {
        seo_vi:
          "Viết lại tiếng Việt, giọng thân thiện, thêm headings hợp lý, tối ưu SEO nhẹ. Không bịa, không thêm claim mới.",
        summarize:
          "Tóm tắt rõ ràng (VN), giữ ý chính, phù hợp hiển thị nhanh. Không bịa.",
        normalize_markdown:
          "Chuẩn hóa HTML: headings, bullet, spacing. Không đổi nghĩa.",
        translate_en_vi:
          "Dịch sang tiếng Việt tự nhiên, giữ thuật ngữ kỹ thuật hợp lý. Không bịa.",
      };

      const user = [
        `PRESET: ${presetValue}`,
        `INSTRUCTION: ${presetInstructions[presetValue]}`,
        "",
        `TITLE: ${title}`,
        `TAGS: ${Array.isArray(tags) ? tags.join(", ") : ""}`,
        "",
        "RAW_CONTENT (do not fabricate beyond this):",
        rawBody,
        "",
        "USER_PROMPT (highest priority):",
        String(prompt),
        "",
        "Return JSON with keys: content, excerpt, seo_description, notes.",
        "Constraints:",
        "- content: HTML (800-2500 words if raw allows); if raw is short, keep concise and say so in notes.",
        "- excerpt <= 300 chars (plain text).",
        "- seo_description <= 160 chars (plain text).",
      ].join("\n");

      const aiText = await deepseekChatCompletion({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.4,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });

      const parsed = parseAiRewriteResponse(aiText);

      if (!parsed.content?.trim()) {
        return res.status(502).json({
          message: "AI không trả về nội dung hợp lệ. Hãy thử lại với prompt ngắn hơn.",
        });
      }

      const outContent = toEditorHtml(parsed.content.trim());
      const outExcerpt =
        typeof parsed.excerpt === "string"
          ? clampText(parsed.excerpt, 300)
          : typeof excerpt === "string" && excerpt.trim()
            ? clampText(excerpt, 300)
            : clampText(htmlToPlainText(outContent), 300);
      const outSeo =
        typeof parsed.seo_description === "string"
          ? clampText(parsed.seo_description, 160)
          : typeof seo_description === "string" && seo_description.trim()
            ? clampText(seo_description, 160)
            : clampText(outExcerpt, 160);

      const attributionHtml = attribution ? toEditorHtml(attribution) : "";
      const finalContent =
        keepAttribution && attributionHtml
          ? `${outContent}${attributionHtml}`
          : outContent;

      res.json({
        content: finalContent,
        excerpt: outExcerpt || null,
        seo_description: outSeo || null,
        notes: typeof parsed.notes === "string" ? parsed.notes : null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI rewrite failed";
      if (message.includes("DEEPSEEK_API_KEY")) {
        return res.status(503).json({ message });
      }
      if (message.startsWith("DeepSeek error:")) {
        return res.status(502).json({ message });
      }
      if (message.includes("JSON không hợp lệ") || message.includes("Không đọc được phản hồi AI")) {
        return res.status(502).json({ message });
      }
      next(error);
    }
  },
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, limit = "12", offset = "0" } = req.query;
    const result = await storage.getBlogPosts({
      tag: tag as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      publishedOnly: true,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    if (!post || post.status !== "published") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.post("/", hasRole(["admin"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await storage.createBlogPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", hasRole(["admin"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const post = await storage.updateBlogPost(id, req.body);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", hasRole(["admin"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBlogPost(id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
