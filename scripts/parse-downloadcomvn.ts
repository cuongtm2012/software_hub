/**
 * Playwright crawl download.com.vn → scripts/data/downloadcomvn.json
 * Run: npm run parse:downloadcomvn
 *
 * Env:
 *   PARSE_LIMIT=50          max items per category (default 50)
 *   PARSE_MAX_PAGES=5       max list pages per category (default 5)
 *   PARSE_CATEGORIES=office,android  comma-separated keys (default: all)
 */
import { chromium, type Page } from "playwright";
import {
  type FreeSoftwareEntry,
  normalizePlatforms,
  writeJson,
} from "./lib/data-expansion.js";

type CategoryConfig = {
  path: string;
  platform: string[];
  /** Vietnamese label stored in JSON `category` */
  category: string;
  /** English alias → maps to user-need taxonomy via resolveUseCategorySlug */
  subcategory: string;
};

/** Keys match PARSE_CATEGORIES env values */
const CATEGORY_PATHS: Record<string, CategoryConfig> = {
  windows: {
    path: "/windows",
    platform: ["windows"],
    category: "Phần mềm Windows",
    subcategory: "utility",
  },
  games: {
    path: "/download-game-tro-choi",
    platform: ["windows"],
    category: "Game",
    subcategory: "games",
  },
  office: {
    path: "/download-phan-mem-van-phong",
    platform: ["windows"],
    category: "Văn phòng & Năng suất",
    subcategory: "office",
  },
  education: {
    path: "/download-phan-mem-giao-duc",
    platform: ["windows"],
    category: "Giáo dục",
    subcategory: "education",
  },
  video: {
    path: "/download-phan-mem-video",
    platform: ["windows"],
    category: "Âm thanh & Video",
    subcategory: "video",
  },
  devtools: {
    path: "/download-cong-cu-lap-trinh",
    platform: ["windows"],
    category: "Lập trình & DevOps",
    subcategory: "development",
  },
  business: {
    path: "/download-phan-mem-doanh-nghiep",
    platform: ["windows"],
    category: "Văn phòng & Năng suất",
    subcategory: "office",
  },
  network: {
    path: "/download-phan-mem-mang",
    platform: ["windows"],
    category: "Internet & Trình duyệt",
    subcategory: "internet",
  },
  audio: {
    path: "/download-phan-mem-nhac-audio",
    platform: ["windows"],
    category: "Âm thanh & Video",
    subcategory: "audio",
  },
  driver: {
    path: "/download-driver-firmware",
    platform: ["windows"],
    category: "Tiện ích hệ thống",
    subcategory: "utility",
  },
  graphics: {
    path: "/download-do-hoa",
    platform: ["windows"],
    category: "Đồ họa & Thiết kế",
    subcategory: "graphics",
  },
  social: {
    path: "/download-mang-xa-hoi",
    platform: ["windows"],
    category: "Chat & Liên lạc",
    subcategory: "communication",
  },
  android: {
    path: "/android",
    platform: ["android"],
    category: "Ứng dụng Android",
    subcategory: "utility",
  },
  ios: {
    path: "/ios",
    platform: ["ios"],
    category: "Ứng dụng iOS",
    subcategory: "utility",
  },
};

const MIRROR_HOSTS = [
  "fa.getpedia.net",
  "getpedia.net",
  "bit.ly",
  "tinyurl.com",
  "goo.gl",
];

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

function randomDelay(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function absoluteUrl(href: string): string {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  return `https://download.com.vn${href.startsWith("/") ? "" : "/"}${href}`;
}

function isMirrorLink(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return MIRROR_HOSTS.some((m) => host === m || host.endsWith(`.${m}`));
  } catch {
    return false;
  }
}

function pickDownloadLink(raw: string | null, pageUrl: string): string {
  if (raw && raw.trim() && !isMirrorLink(raw.trim())) {
    return raw.trim();
  }
  return pageUrl;
}

type ListItem = {
  name: string;
  description: string;
  href: string;
};

type DetailMeta = {
  downloadLink: string | null;
  version?: string;
  vendor?: string;
  license?: string;
  imageUrl?: string | null;
  description?: string;
};

async function scrapeListPage(page: Page, listUrl: string): Promise<ListItem[]> {
  await page.goto(listUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(randomDelay(1500, 2500));

  return page.$$eval("ul.listitem-view li.clearfix", (nodes) =>
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
}

async function extractDetailPage(
  page: Page,
  pageUrl: string,
): Promise<DetailMeta> {
  try {
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(randomDelay(1500, 2500));

    const meta = await page.evaluate(() => {
      const infoRows = [
        ...document.querySelectorAll(
          ".box-info li, .info-software li, .detail-info li, .box-detail-info li, .info-detail li",
        ),
      ].map((el) => el.textContent?.trim() ?? "");

      let version;
      let vendor;
      let license;

      for (const row of infoRows) {
        const lower = row.toLowerCase();
        if (lower.startsWith("version:") || lower.startsWith("phiên bản:")) {
          version = row.split(":").slice(1).join(":").trim();
        } else if (
          lower.startsWith("phát hành:") ||
          lower.startsWith("nhà phát hành:") ||
          lower.startsWith("tác giả:")
        ) {
          vendor = row.split(":").slice(1).join(":").trim();
        } else if (
          lower.startsWith("sử dụng:") ||
          lower.startsWith("bản quyền:") ||
          lower.startsWith("license:")
        ) {
          license = row.split(":").slice(1).join(":").trim();
        }
      }

      const downloadEl = document.querySelector("#DownloadButtonTop");
      const downloadLink =
        downloadEl?.getAttribute("data-downloadurl")?.trim() ||
        document
          .querySelector(".download-link-button")
          ?.getAttribute("downloadurl")
          ?.trim() ||
        document
          .querySelector("[data-downloadurl]")
          ?.getAttribute("data-downloadurl")
          ?.trim() ||
        null;

      const ogImage =
        document.querySelector('meta[property="og:image"]')?.getAttribute("content") ??
        null;

      const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";
      const versionFromTitle = h1.match(/\b(\d+\.\d+(?:\.\d+)?)\b/)?.[1];

      const metaDesc =
        document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ??
        "";

      const articleParas = [
        ...document.querySelectorAll(
          ".article-content p, .content-detail p, .box-content p, .detail-content p, #content p",
        ),
      ]
        .map((p) => p.textContent?.replace(/\s+/g, " ").trim() ?? "")
        .filter((t) => t.length > 40);

      const articleDesc = articleParas[0] || metaDesc || undefined;

      return {
        downloadLink,
        version: version || versionFromTitle,
        vendor,
        license,
        imageUrl: ogImage,
        description: articleDesc,
      };
    });

    return meta;
  } catch (err) {
    console.warn(`  Failed detail page ${pageUrl}:`, err);
    return { downloadLink: null };
  }
}

async function crawlCategory(
  page: Page,
  cfg: CategoryConfig,
  maxItems: number,
  maxPages: number,
): Promise<FreeSoftwareEntry[]> {
  const entries: FreeSoftwareEntry[] = [];
  const baseUrl = `https://download.com.vn${cfg.path}`;
  const seenNames = new Set<string>();

  for (let pageNum = 1; pageNum <= maxPages && entries.length < maxItems; pageNum++) {
    const listUrl = pageNum === 1 ? baseUrl : `${baseUrl}?p=${pageNum}`;
    console.log(`  List page ${pageNum}: ${listUrl}`);

    let items: ListItem[];
    try {
      items = await scrapeListPage(page, listUrl);
    } catch (err) {
      console.warn(`  Failed list page ${pageNum}:`, err);
      break;
    }

    if (items.length === 0) {
      console.log(`  No items on page ${pageNum}, stopping pagination`);
      break;
    }

    for (const item of items) {
      if (entries.length >= maxItems) break;
      if (!item.name || item.name.length < 2) continue;

      const nameKey = item.name.toLowerCase();
      if (seenNames.has(nameKey)) continue;
      seenNames.add(nameKey);

      const url = item.href
        ? absoluteUrl(item.href)
        : `https://download.com.vn/search?q=${encodeURIComponent(item.name)}`;

      console.log(`  Visiting ${url}...`);
      const detail = await extractDetailPage(page, url);
      await sleep(randomDelay(600, 1400));

      const downloadLink = pickDownloadLink(detail.downloadLink, url);
      const description = (
        detail.description ||
        item.description ||
        `${item.name} — phần mềm miễn phí`
      )
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 500);

      entries.push({
        name: item.name,
        description,
        category: cfg.category,
        subcategory: cfg.subcategory,
        url,
        download_link: downloadLink,
        platform: normalizePlatforms(cfg.platform),
        license: detail.license || "Freeware",
        vendor: detail.vendor,
        version: detail.version,
        image_url: detail.imageUrl,
        source: "download.com.vn",
      });

      if (detail.downloadLink && !isMirrorLink(detail.downloadLink)) {
        console.log(`    → Download: ${downloadLink}`);
      } else if (detail.downloadLink && isMirrorLink(detail.downloadLink)) {
        console.log(`    → Mirror blocked, using page URL`);
      } else {
        console.log(`    → No download link, using page URL`);
      }
    }

    if (pageNum < maxPages) {
      await sleep(randomDelay(1000, 2000));
    }
  }

  console.log(`  Collected ${entries.length} items`);
  return entries;
}

async function main() {
  const maxPerCategory = Number(process.env.PARSE_LIMIT || "50");
  const maxPages = Number(process.env.PARSE_MAX_PAGES || "5");
  const allKeys = Object.keys(CATEGORY_PATHS);
  const categoryFilter = (process.env.PARSE_CATEGORIES || allKeys.join(","))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(
    `Parse download.com.vn — limit=${maxPerCategory}/category, maxPages=${maxPages}, categories=${categoryFilter.join(",")}`,
  );

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: USER_AGENT });

  const all: FreeSoftwareEntry[] = [];

  try {
    for (const key of categoryFilter) {
      const cfg = CATEGORY_PATHS[key];
      if (!cfg) {
        console.warn(`Unknown category key: ${key} (available: ${allKeys.join(", ")})`);
        continue;
      }
      console.log(`\nCrawling [${key}] ${cfg.path}...`);
      try {
        const batch = await crawlCategory(page, cfg, maxPerCategory, maxPages);
        console.log(`  → ${batch.length} items from ${key}`);
        all.push(...batch);
      } catch (err) {
        console.warn(`  Failed category ${key}:`, err);
      }
      await sleep(randomDelay(1500, 3000));
    }
  } finally {
    await browser.close();
  }

  const unique = new Map<string, FreeSoftwareEntry>();
  for (const e of all) unique.set(e.name.toLowerCase(), e);

  const entries = [...unique.values()];
  console.log(`\nTotal unique: ${entries.length}`);
  writeJson("downloadcomvn.json", { source: "download.com.vn", entries });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
