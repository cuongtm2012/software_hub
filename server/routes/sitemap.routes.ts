import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";

const router = Router();

const SITE_URL = process.env.SITE_URL || "https://softwarehub.com";

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
      { loc: "/ebook/fullstack-roadmap", priority: "0.7", changefreq: "monthly" },
      { loc: "/booking", priority: "0.7", changefreq: "monthly" },
      { loc: "/it-services", priority: "0.8", changefreq: "weekly" },
    ];

    const [coursesResult, blogResult, softwareResult] = await Promise.all([
      storage.getCourses({ limit: 500, offset: 0 }),
      storage.getBlogPosts({ limit: 500, offset: 0, publishedOnly: true }),
      storage.getSoftwareList({ status: "approved", limit: 500, offset: 0 }),
    ]);

    const urls: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [
      ...staticPages,
      ...coursesResult.courses.map((c: any) => ({
        loc: `/courses/${c.slug || c.id}`,
        priority: "0.8",
        changefreq: "weekly",
        lastmod: c.updated_at ? new Date(c.updated_at).toISOString().split("T")[0] : undefined,
      })),
      ...blogResult.posts.map((p: any) => ({
        loc: `/blog/${p.slug}`,
        priority: "0.8",
        changefreq: "weekly",
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
      })),
      ...softwareResult.softwares.map((s: any) => ({
        loc: `/software/${s.slug || s.id}`,
        priority: "0.7",
        changefreq: "monthly",
        lastmod: s.created_at ? new Date(s.created_at).toISOString().split("T")[0] : undefined,
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

Sitemap: ${SITE_URL}/sitemap.xml
`);
});

export default router;
