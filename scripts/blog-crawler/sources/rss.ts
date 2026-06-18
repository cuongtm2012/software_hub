import Parser from "rss-parser";
import type { CrawledPost } from "../types";
import {
  buildAttributionBlock,
  clampText,
  htmlToText,
  normalizeTags,
  stripHtml,
} from "../utils";

const parser = new Parser({
  headers: {
    // Some feeds will 429/deny default agent-less requests.
    "User-Agent":
      "SoftwareHubBot/1.0 (+https://swhubco.com; contact: admin@swhubco.com)",
  },
});

export async function crawlRss(opts: {
  source: "freecodecamp" | "hashnode";
  rssUrl: string;
  maxItems: number;
}): Promise<CrawledPost[]> {
  const feed = await parser.parseURL(opts.rssUrl);

  const sourceName = opts.source === "freecodecamp" ? "freeCodeCamp" : "Hashnode";
  const sourceTag = `source:${opts.source}`;
  const langTag = "lang:en";

  return (feed.items ?? [])
    .slice(0, opts.maxItems)
    .filter((it) => it?.title && (it.link || (it as any).guid))
    .map((it): CrawledPost => {
      const sourceUrl = it.link || (it as any).guid;
      const title = stripHtml(String(it.title ?? "")).replace(/\s+/g, " ").trim();
      const fullHtml =
        ((it as any)["content:encoded"] as string | undefined) ||
        (it.content as string | undefined) ||
        (it.summary as string | undefined) ||
        "";
      const snippet =
        (it.contentSnippet as string | undefined) ||
        (it.summary as string | undefined) ||
        fullHtml ||
        "";

      const excerpt = snippet ? clampText(stripHtml(snippet), 300) : undefined;
      const tags = normalizeTags([sourceTag, langTag]);

      const bodyText = fullHtml ? clampText(htmlToText(fullHtml), 6000) : "";
      const content =
        (bodyText ? `${bodyText}\n` : excerpt ? `${excerpt}\n` : "") +
        buildAttributionBlock({
          sourceName,
          sourceUrl,
          originalTitle: title || undefined,
        });

      return {
        source: opts.source,
        sourceUrl,
        title: title || "Untitled",
        excerpt,
        content,
        tags,
        publishedAt: (it.isoDate as string | undefined) ?? undefined,
      };
    });
}

