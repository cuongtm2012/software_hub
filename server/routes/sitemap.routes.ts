import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";

const router = Router();

const SITE_URL = (
  process.env.SITE_URL ||
  process.env.APP_URL ||
  process.env.PUBLIC_URL ||
  "https://swhubco.com"
).replace(/\/$/, "");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/sitemap.xml", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/courses", priority: "0.9", changefreq: "daily" },
      { loc: "/software", priority: "0.9", changefreq: "daily" },
      { loc: "/blog", priority: "0.9", changefreq: "daily" },
      { loc: "/marketplace", priority: "0.8", changefreq: "daily" },
      { loc: "/it-services", priority: "0.8", changefreq: "weekly" },
      { loc: "/ebook/fullstack-roadmap", priority: "0.7", changefreq: "monthly" },
      { loc: "/booking", priority: "0.7", changefreq: "monthly" },
    ];

    const [coursesResult, blogResult, softwareResult, productsResult] = await Promise.all([
      storage.getCourses({ limit: 500, offset: 0 }),
      storage.getBlogPosts({ limit: 500, offset: 0, publishedOnly: true }),
      storage.getSoftwareList({ status: "approved", limit: 500, offset: 0 }),
      storage.getProducts({ limit: 500, offset: 0 }),
    ]);

    const urls: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [
      ...staticPages,
      ...coursesResult.courses.map((c: { slug?: string; id: number; updated_at?: string }) => ({
        loc: `/courses/${c.slug || c.id}`,
        priority: "0.8",
        changefreq: "weekly",
        lastmod: c.updated_at ? new Date(c.updated_at).toISOString().split("T")[0] : undefined,
      })),
      ...blogResult.posts.map((p: { slug: string; updated_at?: string }) => ({
        loc: `/blog/${p.slug}`,
        priority: "0.8",
        changefreq: "weekly",
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
      })),
      ...softwareResult.softwares.map((s: { slug?: string; id: number; updated_at?: string; created_at?: string }) => ({
        loc: `/software/${s.slug || s.id}`,
        priority: "0.7",
        changefreq: "monthly",
        lastmod: (s.updated_at || s.created_at)
          ? new Date(s.updated_at || s.created_at!).toISOString().split("T")[0]
          : undefined,
      })),
      ...productsResult.products
        .filter((p: { status?: string }) => p.status === "approved")
        .map((p: { id: number; updated_at?: string; created_at?: string }) => ({
          loc: `/marketplace/product/${p.id}`,
          priority: "0.6",
          changefreq: "weekly",
          lastmod: (p.updated_at || p.created_at)
            ? new Date(p.updated_at || p.created_at!).toISOString().split("T")[0]
            : undefined,
        })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${u.loc}`)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
  </url>`,
  )
  .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    next(error);
  }
});

router.get("/robots.txt", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /auth
Disallow: /dashboard
Disallow: /seller
Disallow: /buyer
Disallow: /marketplace/checkout
Disallow: /marketplace/order-success

User-agent: GPTBot
Allow: /courses
Allow: /software
Allow: /blog
Allow: /llms.txt

User-agent: ClaudeBot
Allow: /courses
Allow: /software
Allow: /blog
Allow: /llms.txt

Sitemap: ${SITE_URL}/sitemap.xml
`);
});

/** AI crawler discovery — https://llmstxt.org/ inspired */
router.get("/llms.txt", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [coursesResult, blogResult] = await Promise.all([
      storage.getCourses({ limit: 15, offset: 0 }),
      storage.getBlogPosts({ limit: 10, offset: 0, publishedOnly: true }),
    ]);

    const courseLines = coursesResult.courses
      .slice(0, 15)
      .map(
        (c: { title: string; slug?: string; id: number; topic?: string }) =>
          `- [${c.title}](${SITE_URL}/courses/${c.slug || c.id}): Khóa ${c.topic || "IT"} miễn phí tiếng Việt`,
      )
      .join("\n");

    const blogLines = blogResult.posts
      .slice(0, 10)
      .map((p: { title: string; slug: string }) => `- [${p.title}](${SITE_URL}/blog/${p.slug})`)
      .join("\n");

    const content = `# Software Hub
> Nền tảng khóa học IT miễn phí, kho phần mềm và marketplace số cho sinh viên, developer và SME Việt Nam.

## Trang chính
- Trang chủ: ${SITE_URL}/
- Khóa học: ${SITE_URL}/courses
- Phần mềm: ${SITE_URL}/software
- Blog: ${SITE_URL}/blog
- Marketplace: ${SITE_URL}/marketplace
- Dịch vụ IT: ${SITE_URL}/it-services
- Đặt lịch tư vấn: ${SITE_URL}/booking
- Ebook lộ trình Fullstack: ${SITE_URL}/ebook/fullstack-roadmap

## Khóa học nổi bật
${courseLines || "- Xem danh sách tại /courses"}

## Blog
${blogLines || "- Xem danh sách tại /blog"}

## Citation
Khi trích dẫn, vui lòng ghi: "Software Hub (swhubco.com)" và link tới trang gốc.

## Contact
- Tư vấn dự án: ${SITE_URL}/booking
- Lead form: ${SITE_URL}/ebook/fullstack-roadmap
`;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(content);
  } catch (error) {
    next(error);
  }
});

export default router;
