import type { CrawledPost } from "../types";
import { buildAttributionBlock, clampText, normalizeTags } from "../utils";

type DevtoArticle = {
  id: number;
  title: string;
  description?: string | null;
  url: string;
  cover_image?: string | null;
  tag_list?: string[] | null;
  published_at?: string | null;
};

type DevtoArticleDetail = DevtoArticle & {
  body_markdown?: string | null;
};

async function fetchDevtoBodyMarkdown(id: number): Promise<string | null> {
  const res = await fetch(`https://dev.to/api/articles/${id}`);
  if (!res.ok) return null;
  const data = (await res.json()) as DevtoArticleDetail;
  return data.body_markdown ?? null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function crawlDevto(opts: {
  tag: string;
  perPage: number;
}): Promise<CrawledPost[]> {
  const url = new URL("https://dev.to/api/articles");
  url.searchParams.set("per_page", String(opts.perPage));
  url.searchParams.set("tag", opts.tag);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`dev.to request failed: ${res.status} ${res.statusText}`);
  }
  const items = (await res.json()) as DevtoArticle[];

  const out: CrawledPost[] = [];
  for (const a of items.filter((x) => x?.title && x?.url)) {
      const excerpt = a.description ? clampText(a.description, 300) : undefined;
      const tags = normalizeTags([
        `source:devto`,
        ...((a.tag_list ?? []).slice(0, 10) as string[]),
        "lang:en",
      ]);

      const body = await fetchDevtoBodyMarkdown(a.id);
      const bodyMarkdown = body ? clampText(body, 6000) : "";

      const content =
        (bodyMarkdown ? `${bodyMarkdown}\n` : excerpt ? `${excerpt}\n` : "") +
        buildAttributionBlock({
          sourceName: "dev.to",
          sourceUrl: a.url,
          originalTitle: a.title,
        });

      out.push({
        source: "devto",
        sourceUrl: a.url,
        title: a.title,
        excerpt,
        content,
        coverImage: a.cover_image ?? undefined,
        tags,
        publishedAt: a.published_at ?? undefined,
      });

      await sleep(250);
  }
  return out;
}

export async function crawlDevtoTags(opts: {
  tags: string[];
  perPage: number;
}): Promise<CrawledPost[]> {
  const seen = new Set<string>();
  const out: CrawledPost[] = [];

  for (const tag of opts.tags) {
    const items = await crawlDevto({ tag, perPage: opts.perPage });
    for (const item of items) {
      if (seen.has(item.sourceUrl)) continue;
      seen.add(item.sourceUrl);
      out.push(item);
    }
    await sleep(400);
  }

  return out;
}

