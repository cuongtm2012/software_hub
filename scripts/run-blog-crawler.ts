/**
 * Blog crawler: import curated external posts as draft blog_posts.
 *
 * Run:
 *   npm run blog:crawl
 *   npm run blog:crawl -- --dry-run
 *   npm run blog:crawl -- --sources=devto,freecodecamp --limit=5
 */
import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { db } from "../server/db";
import { blogPosts } from "../shared/schema";
import type { BlogCrawlerSource, CrawledPost } from "./blog-crawler/types";
import { toBlogSlug } from "./blog-crawler/utils";
import { BLOG_CRAWLER_CONFIG } from "./blog-crawler/config";
import { crawlDevtoTags } from "./blog-crawler/sources/devto";
import { crawlRss } from "./blog-crawler/sources/rss";

type Args = {
  dryRun: boolean;
  limitPerSource: number;
  sources: BlogCrawlerSource[];
};

function parseArgs(argv: string[]): Args {
  const out: Args = {
    dryRun: false,
    limitPerSource: BLOG_CRAWLER_CONFIG.maxPostsPerSource,
    sources: ["devto", "freecodecamp", "hashnode"],
  };

  for (const raw of argv) {
    if (raw === "--dry-run") out.dryRun = true;
    if (raw.startsWith("--limit=")) {
      const n = Number(raw.split("=", 2)[1]);
      if (Number.isFinite(n) && n > 0) out.limitPerSource = Math.min(50, n);
    }
    if (raw.startsWith("--sources=")) {
      const s = raw.split("=", 2)[1] || "";
      const parsed = s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean) as BlogCrawlerSource[];
      if (parsed.length) out.sources = parsed;
    }
  }

  return out;
}

async function getExistingSlugs(slugs: string[]): Promise<Set<string>> {
  if (slugs.length === 0) return new Set();
  const rows = await db
    .select({ slug: blogPosts.slug })
    .from(blogPosts)
    .where(inArray(blogPosts.slug, slugs));
  return new Set(rows.map((r) => r.slug));
}

async function getExistingPostsBySlug(
  slugs: string[],
): Promise<Map<string, { id: number; slug: string; status: string; content: string | null }>> {
  if (slugs.length === 0) return new Map();
  const rows = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      status: blogPosts.status,
      content: blogPosts.content,
    })
    .from(blogPosts)
    .where(inArray(blogPosts.slug, slugs));
  return new Map(rows.map((r) => [r.slug, r]));
}

async function insertDraftPosts(posts: CrawledPost[], dryRun: boolean) {
  const candidates = posts.map((p) => ({ ...p, slug: toBlogSlug(p.title) }));
  const existingBySlug = await getExistingPostsBySlug(candidates.map((c) => c.slug));

  const toInsert = candidates.filter((c) => !existingBySlug.has(c.slug));
  const toMaybeUpdate = candidates.filter((c) => existingBySlug.has(c.slug));

  // If duplicate: only update when existing is draft AND new content is meaningfully longer.
  const toUpdate = toMaybeUpdate
    .map((candidate) => {
      const existing = existingBySlug.get(candidate.slug)!;
      const existingLen = (existing.content ?? "").length;
      const newLen = (candidate.content ?? "").length;
      const shouldUpdate =
        existing.status === "draft" && newLen > Math.max(500, existingLen + 200);
      return { existing, candidate, shouldUpdate };
    })
    .filter((x) => x.shouldUpdate);

  if (dryRun) {
    return {
      inserted: 0,
      updated: 0,
      skipped: candidates.length - toInsert.length - toUpdate.length,
      toInsert,
      toUpdate,
    };
  }

  const now = new Date();
  if (toInsert.length > 0) {
    await db.insert(blogPosts).values(
      toInsert.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        seo_description: p.excerpt ? p.excerpt.slice(0, 160) : undefined,
        cover_image: p.coverImage,
        author_name: "Curation Bot",
        tags: p.tags,
        status: "draft",
        published_at: null,
        created_at: now,
        updated_at: now,
      })),
    );
  }

  if (toUpdate.length > 0) {
    for (const { existing, candidate } of toUpdate) {
      await db
        .update(blogPosts)
        .set({
          title: candidate.title,
          excerpt: candidate.excerpt ?? null,
          content: candidate.content,
          seo_description: candidate.excerpt ? candidate.excerpt.slice(0, 160) : null,
          cover_image: candidate.coverImage ?? null,
          tags: candidate.tags,
          updated_at: now,
        })
        .where(eq(blogPosts.id, existing.id));
    }
  }

  const skipped = candidates.length - toInsert.length - toUpdate.length;
  return { inserted: toInsert.length, updated: toUpdate.length, skipped, toInsert: [] };
}

async function crawlSource(source: BlogCrawlerSource, limitPerSource: number) {
  if (source === "devto") {
    return crawlDevtoTags({
      tags: BLOG_CRAWLER_CONFIG.devto.tags,
      perPage: limitPerSource,
    });
  }
  if (source === "freecodecamp") {
    return crawlRss({
      source: "freecodecamp",
      rssUrl: BLOG_CRAWLER_CONFIG.rss.freecodecampUrl,
      maxItems: limitPerSource,
    });
  }
  if (source === "hashnode") {
    return crawlRss({
      source: "hashnode",
      rssUrl: BLOG_CRAWLER_CONFIG.rss.hashnodeUrl,
      maxItems: limitPerSource,
    });
  }

  // Not implemented yet (kept for SPEC parity)
  return [] as CrawledPost[];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const summary: Record<string, { total: number; inserted: number; skipped: number }> = {};

  for (const source of args.sources) {
    try {
      const items = await crawlSource(source, args.limitPerSource);
      const { inserted, updated, skipped, toInsert, toUpdate } = await insertDraftPosts(
        items,
        args.dryRun,
      );

      summary[source] = { total: items.length, inserted: inserted + (updated ?? 0), skipped };

      if (args.dryRun) {
        if (toInsert.length) {
          console.log(`\n[dry-run] ${source}: would insert ${toInsert.length} posts`);
          for (const p of toInsert.slice(0, 10)) console.log(`- ${p.slug} — ${p.title}`);
        }
        if (toUpdate?.length) {
          console.log(`\n[dry-run] ${source}: would update ${toUpdate.length} draft posts`);
          for (const u of toUpdate.slice(0, 10)) {
            console.log(`- ${u.existing.slug} (id=${u.existing.id}) — ${u.candidate.title}`);
          }
        }
      } else {
        console.log(
          `${source}: ${items.length} posts (${inserted} new, ${updated ?? 0} updated, ${skipped} skipped)`,
        );
      }
    } catch (err) {
      summary[source] = { total: 0, inserted: 0, skipped: 0 };
      console.warn(`${source}: failed to crawl`, err);
    }
  }

  const insertedTotal = Object.values(summary).reduce((a, s) => a + s.inserted, 0);
  const total = Object.values(summary).reduce((a, s) => a + s.total, 0);

  console.log("\nBlog crawler summary:");
  console.log(`- sources: ${args.sources.join(", ")}`);
  console.log(`- total fetched: ${total}`);
  console.log(`- inserted drafts: ${insertedTotal}${args.dryRun ? " (dry-run)" : ""}`);
}

main().catch((err) => {
  console.error("blog crawler failed:", err);
  process.exitCode = 1;
});

