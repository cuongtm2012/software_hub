/**
 * Playwright crawl download.com.vn → scripts/data/downloadcomvn.json
 * Run: npm run parse:downloadcomvn
 * Env: PARSE_LIMIT=50 (max items per category), PARSE_CATEGORIES=windows,android
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

async function crawlCategory(
  page: import("playwright").Page,
  baseUrl: string,
  platform: string[],
  maxItems: number,
): Promise<FreeSoftwareEntry[]> {
  const entries: FreeSoftwareEntry[] = [];
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);

  const items = await page.$$eval(".box-iname .item", (nodes) =>
    nodes.map((node) => {
      const titleEl = node.querySelector(".item-title, h3");
      const descEl = node.querySelector(".item-description, span");
      const linkEl = node.querySelector("a[href]");
      return {
        name: titleEl?.textContent?.trim() ?? "",
        description: descEl?.textContent?.trim() ?? "",
        href: linkEl?.getAttribute("href") ?? "",
      };
    }),
  );

  for (const item of items.slice(0, maxItems)) {
    if (!item.name || item.name.length < 2) continue;
    let url = item.href;
    if (url && !url.startsWith("http")) {
      url = `https://download.com.vn${url.startsWith("/") ? "" : "/"}${url}`;
    }
    if (!url) url = `https://download.com.vn/search?q=${encodeURIComponent(item.name)}`;

    entries.push({
      name: item.name,
      description: (item.description || `${item.name} — phần mềm miễn phí`).slice(0, 500),
      category: "Phần mềm Việt Nam",
      subcategory: "download.com.vn",
      url,
      download_link: url,
      platform: normalizePlatforms(platform),
      license: "Freeware",
      source: "download.com.vn",
    });
  }

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
        console.log(`  → ${batch.length} items`);
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
