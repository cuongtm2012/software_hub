/**
 * Playwright crawl download.com.vn → scripts/data/downloadcomvn.json
 * Run: npm run parse:downloadcomvn
 * Env: PARSE_LIMIT=50 (max items per category), PARSE_CATEGORIES=windows,android
 *
 * Now visits each detail page to extract the real download URL from data-downloadurl attribute.
 */
import { chromium } from "playwright";
import {
  type FreeSoftwareEntry,
  normalizePlatforms,
  writeJson,
} from "./lib/data-expansion.js";

const CATEGORY_PATHS: Record<string, { path: string; platform: string[] }> = {
  windows: { path: "/windows", platform: ["windows"] },
  android: { path: "/android", platform: ["android"] },
  ios: { path: "/ios", platform: ["ios"] },
  office: { path: "/download-phan-mem-van-phong", platform: ["windows"] },
  education: { path: "/download-phan-mem-giao-duc", platform: ["windows"] },
  graphics: { path: "/download-do-hoa", platform: ["windows"] },
  devtools: { path: "/download-cong-cu-lap-trinh", platform: ["windows"] },
};

/**
 * Visit a single software detail page and extract the real download URL.
 * Strategy:
 * 1. Look for #DownloadButtonTop -> get data-downloadurl attribute
 * 2. Fallback: find any .download-link-button with a downloadurl attribute
 * 3. Fallback: find any element with data-downloadurl attribute
 * 4. Last resort: use the page URL itself
 */
async function extractDownloadLink(
  page: import("playwright").Page,
  pageUrl: string,
  timeout: number = 30000,
): Promise<string | null> {
  try {
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout });
    // Wait a moment for dynamic content to load
    await page.waitForTimeout(2000);

    // Strategy 1: Primary download button with data-downloadurl
    const primaryUrl = await page
      .$eval("#DownloadButtonTop", (el) =>
        el.getAttribute("data-downloadurl"),
      )
      .catch(() => null);
    if (primaryUrl && primaryUrl.trim()) {
      return primaryUrl.trim();
    }

    // Strategy 2: Any .download-link-button with downloadurl attribute
    const linkUrl = await page
      .$eval(".download-link-button", (el) =>
        el.getAttribute("downloadurl"),
      )
      .catch(() => null);
    if (linkUrl && linkUrl.trim()) {
      return linkUrl.trim();
    }

    // Strategy 3: Any element with data-downloadurl (broader search)
    const anyUrl = await page
      .$eval("[data-downloadurl]", (el) =>
        el.getAttribute("data-downloadurl"),
      )
      .catch(() => null);
    if (anyUrl && anyUrl.trim()) {
      return anyUrl.trim();
    }

    // Strategy 4: Any element with downloadurl attribute (broader search)
    const anyDownloadUrl = await page
      .$eval("[downloadurl]", (el) => el.getAttribute("downloadurl"))
      .catch(() => null);
    if (anyDownloadUrl && anyDownloadUrl.trim()) {
      return anyDownloadUrl.trim();
    }

    return null;
  } catch (err) {
    console.warn(`  Failed to extract download link from ${pageUrl}:`, err);
    return null;
  }
}

async function crawlCategory(
  page: import("playwright").Page,
  baseUrl: string,
  platform: string[],
  maxItems: number,
): Promise<FreeSoftwareEntry[]> {
  const entries: FreeSoftwareEntry[] = [];
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  // Structure: ul.listitem-view > li.clearfix > a.title
  // Extract basic info from list page
  const items = await page.$$eval("ul.listitem-view li.clearfix", (nodes) =>
    nodes.map((node) => {
      const linkEl = node.querySelector("a.title");
      const titleEl = node.querySelector(
        ".box-iname .item-title, h3.item-title",
      );
      const descEl = node.querySelector(
        ".box-iname .item-description, span.item-description",
      );
      return {
        name: titleEl?.textContent?.trim() ?? "",
        description: descEl?.textContent?.trim() ?? "",
        href: linkEl?.getAttribute("href") ?? "",
      };
    }),
  );

  let processed = 0;
  for (const item of items.slice(0, maxItems)) {
    if (!item.name || item.name.length < 2) continue;

    let url = item.href;
    if (url && !url.startsWith("http")) {
      url = `https://download.com.vn${url.startsWith("/") ? "" : "/"}${url}`;
    }
    if (!url)
      url = `https://download.com.vn/search?q=${encodeURIComponent(item.name)}`;

    // Visit the detail page to extract the real download link
    console.log(`  Visiting ${url}...`);
    const downloadLink = await extractDownloadLink(page, url);

    entries.push({
      name: item.name,
      description: (item.description || `${item.name} — phần mềm miễn phí`).slice(
        0,
        500,
      ),
      category: "Phần mềm Việt Nam",
      subcategory: "download.com.vn",
      url,
      download_link: downloadLink || url,
      platform: normalizePlatforms(platform),
      license: "Freeware",
      source: "download.com.vn",
    });

    processed++;

    if (downloadLink) {
      console.log(`    → Download: ${downloadLink}`);
    } else {
      console.log(`    → No download link found, using page URL`);
    }
  }

  console.log(`  Processed ${processed} items`);
  return entries;
}

async function main() {
  const maxPerCategory = Number(process.env.PARSE_LIMIT || "30");
  const categoryFilter = (process.env.PARSE_CATEGORIES || "windows,office,android")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  });

  const all: FreeSoftwareEntry[] = [];

  try {
    for (const key of categoryFilter) {
      const cfg = CATEGORY_PATHS[key];
      if (!cfg) {
        console.warn(`Unknown category: ${key}`);
        continue;
      }
      const url = `https://download.com.vn${cfg.path}`;
      console.log(`Crawling ${url}...`);
      try {
        const batch = await crawlCategory(page, url, cfg.platform, maxPerCategory);
        console.log(`  → ${batch.length} items from ${key}`);
        all.push(...batch);
      } catch (err) {
        console.warn(`  Failed ${key}:`, err);
      }
      await page.waitForTimeout(1500);
    }
  } finally {
    await browser.close();
  }

  const unique = new Map<string, FreeSoftwareEntry>();
  for (const e of all) unique.set(e.name.toLowerCase(), e);

  const entries = [...unique.values()];
  console.log(`Total unique: ${entries.length}`);
  writeJson("downloadcomvn.json", { source: "download.com.vn", entries });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
