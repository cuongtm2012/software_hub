import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage.js";

const SITE_URL = (
  process.env.SITE_URL ||
  process.env.APP_URL ||
  process.env.PUBLIC_URL ||
  "https://swhubco.com"
).replace(/\/$/, "");

const BOT_PATTERN =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|applebot|gptbot|chatgpt-user|claudebot|anthropic-ai|perplexitybot|cohere-ai|bytespider|amazonbot/i;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(opts: {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
  bodyText?: string;
}): string {
  const image = opts.ogImage || `${SITE_URL}/og-default.png`;
  const jsonLdBlock = opts.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(opts.jsonLd)}</script>`
    : "";
  const body = opts.bodyText
    ? `<article><h1>${escapeHtml(opts.title.split(" | ")[0])}</h1><p>${escapeHtml(opts.description)}</p><div>${escapeHtml(opts.bodyText).slice(0, 2000)}</div></article>`
    : `<p>${escapeHtml(opts.description)}</p>`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(opts.title)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}" />
  <link rel="canonical" href="${escapeHtml(opts.canonical)}" />
  <meta property="og:title" content="${escapeHtml(opts.title)}" />
  <meta property="og:description" content="${escapeHtml(opts.description)}" />
  <meta property="og:url" content="${escapeHtml(opts.canonical)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="vi_VN" />
  ${jsonLdBlock}
</head>
<body>
  ${body}
  <p><a href="${escapeHtml(opts.canonical)}">Xem trên Software Hub</a></p>
</body>
</html>`;
}

function isBot(req: Request): boolean {
  const ua = req.get("user-agent") || "";
  return BOT_PATTERN.test(ua);
}

export async function seoPrerenderMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.method !== "GET" || !isBot(req)) {
    next();
    return;
  }

  const path = req.path;

  try {
  if (path.startsWith("/courses/")) {
    const idOrSlug = path.slice("/courses/".length);
    if (!idOrSlug || idOrSlug === "courses") {
      next();
      return;
    }
    const numericId = parseInt(idOrSlug, 10);
    const course = !isNaN(numericId)
      ? await storage.getCourseById(numericId)
      : await storage.getCourseBySlug(idOrSlug);
    if (!course) {
      next();
      return;
    }
    const slug = course.slug || course.id;
    const canonical = `${SITE_URL}/courses/${slug}`;
    const level =
      course.level === "beginner"
        ? "người mới"
        : course.level === "advanced"
          ? "nâng cao"
          : "trung cấp";
    const title = `Học ${course.title} miễn phí — Lộ trình cho ${level}`;
    const description =
      course.seo_description ||
      `Học ${course.title} miễn phí — khóa ${course.topic || "IT"} tiếng Việt.`;
    res
      .status(200)
      .type("html")
      .send(
        buildHtml({
          title: `${title} | Software Hub`,
          description,
          canonical,
          ogImage: course.thumbnail_url,
          bodyText: course.seo_content || course.description,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.title,
            description,
            url: canonical,
            inLanguage: "vi",
            isAccessibleForFree: true,
          },
        }),
      );
    return;
  }

  if (path.startsWith("/software/")) {
    const idOrSlug = path.slice("/software/".length);
    if (!idOrSlug) {
      next();
      return;
    }
    const numericId = parseInt(idOrSlug, 10);
    const software = !isNaN(numericId)
      ? await storage.getSoftwareById(numericId)
      : await storage.getSoftwareBySlug(idOrSlug);
    if (!software) {
      next();
      return;
    }
    const slug = software.slug || software.id;
    const canonical = `${SITE_URL}/software/${slug}`;
    const title = `${software.name} — Tải miễn phí & Hướng dẫn cài đặt`;
    const description =
      software.seo_description ||
      `Tải ${software.name} miễn phí. Hướng dẫn cài đặt ${software.platform || "đa nền tảng"} tiếng Việt.`;
    res.status(200).type("html").send(
      buildHtml({
        title: `${title} | Software Hub`,
        description,
        canonical,
        ogImage: software.logo_url || undefined,
        bodyText: software.seo_content || software.description,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: software.name,
          description,
          url: canonical,
          applicationCategory: "DeveloperApplication",
        },
      }),
    );
    return;
  }

  if (path.startsWith("/blog/")) {
    const slug = path.slice("/blog/".length);
    if (!slug) {
      next();
      return;
    }
    const post = await storage.getBlogPostBySlug(slug);
    if (!post || !post.published) {
      next();
      return;
    }
    const canonical = `${SITE_URL}/blog/${slug}`;
    const description = post.seo_description || post.excerpt || post.title;
    res.status(200).type("html").send(
      buildHtml({
        title: `${post.title} | Software Hub Blog`,
        description,
        canonical,
        ogImage: post.cover_image_url,
        bodyText: post.content,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description,
          url: canonical,
          datePublished: post.published_at || post.created_at,
        },
      }),
    );
    return;
  }

  if (path === "/" || path === "/courses" || path === "/software" || path === "/blog") {
    const pages: Record<string, { title: string; description: string }> = {
      "/": {
        title: "Software Hub — Khóa học IT, phần mềm miễn phí & Marketplace",
        description:
          "Học lập trình miễn phí, tải phần mềm và mua sản phẩm số. Nền tảng IT cho sinh viên, developer và SME Việt Nam.",
      },
      "/courses": {
        title: "Khóa học lập trình miễn phí tiếng Việt",
        description:
          "50+ khóa học IT tiếng Việt: React, Python, JavaScript, DevOps và nhiều hơn nữa.",
      },
      "/software": {
        title: "Kho phần mềm miễn phí — Windows, Mac, Linux",
        description: "Tải và khám phá phần mềm, công cụ developer được tuyển chọn.",
      },
      "/blog": {
        title: "Blog IT — Lộ trình học lập trình",
        description: "Bài viết lộ trình học, hướng dẫn IT và tips cho người mới.",
      },
    };
    const page = pages[path];
    res.status(200).type("html").send(
      buildHtml({
        title: `${page.title} | Software Hub`,
        description: page.description,
        canonical: `${SITE_URL}${path === "/" ? "" : path}`,
      }),
    );
    return;
  }
  } catch (err) {
    console.error("SEO prerender error:", err);
  }

  next();
}
