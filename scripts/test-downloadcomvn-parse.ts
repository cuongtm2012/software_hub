/**
 * Verify download.com.vn parser output against live pages.
 * Run: npx tsx scripts/test-downloadcomvn-parse.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { chromium } from "playwright";
import { resolveUseCategorySlug } from "../shared/software-category-taxonomy.js";
import type { FreeSoftwareEntry, ParsedSoftwareBundle } from "./lib/data-expansion.js";

const DATA_PATH = join(import.meta.dirname, "data", "downloadcomvn.json");

const OLD_FORMAT_MARKERS = {
  category: "Phần mềm Việt Nam",
  subcategory: "download.com.vn",
};

const MIRROR_HOSTS = ["fa.getpedia.net", "getpedia.net"];

function loadJson(): ParsedSoftwareBundle {
  return JSON.parse(readFileSync(DATA_PATH, "utf-8")) as ParsedSoftwareBundle;
}

function checkOldFormat(entries: FreeSoftwareEntry[]) {
  const issues: string[] = [];
  for (const e of entries) {
    if (e.category === OLD_FORMAT_MARKERS.category) {
      issues.push(`${e.name}: category cũ "Phần mềm Việt Nam"`);
    }
    if (e.subcategory === OLD_FORMAT_MARKERS.subcategory) {
      issues.push(`${e.name}: subcategory cũ "download.com.vn"`);
    }
    if (e.download_link && MIRROR_HOSTS.some((h) => e.download_link!.includes(h))) {
      issues.push(`${e.name}: mirror link ${e.download_link}`);
    }
    if (!e.url?.includes("download.com.vn")) {
      issues.push(`${e.name}: url không phải download.com.vn`);
    }
    const slug = resolveUseCategorySlug(e.subcategory || e.category);
    if (slug === "khac" && !["windows", "android", "ios"].includes(e.subcategory)) {
      issues.push(`${e.name}: taxonomy → khac (subcategory=${e.subcategory})`);
    }
  }
  return issues;
}

async function fetchLiveSnippet(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);

  const live = await page.evaluate(() => {
    const listDesc = null;
    const infoRows = [
      ...document.querySelectorAll(
        ".box-info li, .info-software li, .detail-info li, .box-detail-info li, .info-detail li",
      ),
    ].map((el) => el.textContent?.trim() ?? "");

    const articleParas = [
      ...document.querySelectorAll(
        ".article-content p, .content-detail p, .box-content p, .detail-content p, #content p",
      ),
    ]
      .map((p) => p.textContent?.trim() ?? "")
      .filter((t) => t.length > 20);

    const metaDesc =
      document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";

    const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";
    const ogImage =
      document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "";

    return {
      h1,
      metaDesc,
      ogImage,
      infoRows: infoRows.slice(0, 8),
      articleParas: articleParas.slice(0, 3),
      articleSelectorCount: document.querySelectorAll(
        ".article-content p, .content-detail p, .box-content p, .detail-content p, #content p",
      ).length,
    };
  });

  await browser.close();
  return live;
}

function descQuality(entry: FreeSoftwareEntry, live: Awaited<ReturnType<typeof fetchLiveSnippet>>) {
  const parsed = entry.description?.trim() ?? "";
  const candidates = [
    live.metaDesc,
    ...live.articleParas,
    live.h1,
  ].filter(Boolean);

  const isGeneric =
    parsed.endsWith("— phần mềm miễn phí") ||
    parsed === `${entry.name} — phần mềm miễn phí`;

  const matchesLive = candidates.some(
    (c) =>
      c.includes(parsed.slice(0, 30)) ||
      parsed.includes(c.slice(0, 30)) ||
      (parsed.length > 20 && c.length > 20 && parsed.slice(0, 15) === c.slice(0, 15)),
  );

  return {
    parsed,
    isGeneric,
    matchesLive,
    liveMetaDesc: live.metaDesc,
    liveArticleSample: live.articleParas[0] ?? null,
    articleSelectorCount: live.articleSelectorCount,
  };
}

async function main() {
  console.log("=== download.com.vn parse verification ===\n");

  const bundle = loadJson();
  const entries = bundle.entries;
  console.log(`JSON entries: ${entries.length}`);
  console.log(`Source: ${bundle.source}\n`);

  // 1. Old format check
  const formatIssues = checkOldFormat(entries);
  console.log("--- Old format / mirror check ---");
  if (formatIssues.length === 0) {
    console.log("OK: Không có category/subcategory cũ, không có mirror link\n");
  } else {
    for (const i of formatIssues) console.log("ISSUE:", i);
    console.log();
  }

  // 2. Field completeness
  console.log("--- Field completeness ---");
  const stats = {
    hasDescription: 0,
    hasVendor: 0,
    hasVersion: 0,
    hasImage: 0,
    hasRealDownload: 0,
    genericDesc: 0,
  };
  for (const e of entries) {
    if (e.description && e.description.length > 5) stats.hasDescription++;
    if (e.vendor) stats.hasVendor++;
    if (e.version) stats.hasVersion++;
    if (e.image_url) stats.hasImage++;
    if (e.download_link && e.download_link !== e.url) stats.hasRealDownload++;
    if (e.description?.includes("— phần mềm miễn phí")) stats.genericDesc++;
  }
  console.log(JSON.stringify(stats, null, 2));
  console.log();

  // 3. Taxonomy sample
  console.log("--- Taxonomy mapping (sample) ---");
  for (const e of entries.slice(0, 5)) {
    const slug = resolveUseCategorySlug(e.subcategory || e.category);
    console.log(`  ${e.name}: subcategory=${e.subcategory} → ${slug}`);
  }
  console.log();

  // 4. Live compare for up to 4 entries
  const sample = entries.slice(0, 4);
  console.log("--- Live site vs parsed (description) ---");
  for (const entry of sample) {
    console.log(`\n[${entry.name}]`);
    console.log(`  URL: ${entry.url}`);
    try {
      const live = await fetchLiveSnippet(entry.url);
      const q = descQuality(entry, live);
      console.log(`  Parsed desc: "${q.parsed}"`);
      console.log(`  Generic fallback: ${q.isGeneric}`);
      console.log(`  Matches live content: ${q.matchesLive}`);
      console.log(`  Live meta description: "${q.liveMetaDesc?.slice(0, 120) ?? ""}"`);
      console.log(`  Live article p[0]: "${q.liveArticleSample?.slice(0, 120) ?? "(none)"}"`);
      console.log(`  Article <p> count on page: ${q.articleSelectorCount}`);
      if (live.ogImage && entry.image_url) {
        console.log(`  Image match: ${entry.image_url === live.ogImage ? "yes" : "diff"}`);
      }
    } catch (err) {
      console.log(`  ERROR fetching live: ${err}`);
    }
  }

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
