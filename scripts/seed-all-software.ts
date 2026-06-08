/**
 * Fetch awesome-list READMEs from GitHub and seed software catalog to Supabase.
 * Run: npm run seed:software
 */
import { db, pool } from "../server/db";
import { categories, softwares, users } from "../shared/schema";
import { eq, and, isNull } from "drizzle-orm";
import { slugify } from "../server/lib/slug";

interface SoftwareEntry {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  url: string;
  platform: string[];
  license?: string;
}

const SOURCES = [
  {
    url: "https://raw.githubusercontent.com/thechampagne/awesome-windows/main/README.md",
    category: "Windows Software",
  },
  {
    url: "https://raw.githubusercontent.com/luong-komorebi/Awesome-Linux-Software/master/README.md",
    category: "Linux Software",
  },
  {
    url: "https://raw.githubusercontent.com/johnjago/awesome-free-software/master/README.md",
    category: "Free Software",
  },
  {
    url: "https://raw.githubusercontent.com/Axorax/awesome-free-apps/main/README.md",
    category: "Free Apps",
  },
  {
    url: "https://raw.githubusercontent.com/awesome-foss/awesome-sysadmin/master/README.md",
    category: "Sysadmin Tools",
  },
  {
    url: "https://raw.githubusercontent.com/TonnyL/Awesome_APIs/master/README.md",
    category: "APIs & Services",
  },
];

function parseReadme(content: string, mainCategory: string): SoftwareEntry[] {
  const entries: SoftwareEntry[] = [];
  const lines = content.split("\n");
  let currentSubcategory = "General";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("## ") || line.startsWith("### ")) {
      currentSubcategory = line.replace(/^#+\s+/, "").replace(/\[.*?\]\(.*?\)/g, "").trim();
      continue;
    }
    if (!line.startsWith("- ")) continue;

    const nameMatch = line.match(/\*?\*?\[([^\]]+)\]\(([^)]+)\)\*?\*?/);
    if (!nameMatch) continue;

    const name = nameMatch[1].trim();
    const url = nameMatch[2].trim();
    let description =
      line.split(/\)\s*[-–—]\s*/)[1] ||
      line.split(/\*\*\s*[-–—]\s*/)[1] ||
      line.split(/\)\s+/)[1] ||
      "";
    description = description.replace(/\.$/, "").trim();

    if (!description || description.length < 8) continue;
    if (name.toLowerCase().includes("back to top")) continue;

    const lower = description.toLowerCase();
    const platform: string[] = [];
    if (lower.includes("android")) platform.push("android");
    if (lower.includes("ios") || lower.includes("iphone")) platform.push("ios");
    if (lower.includes("mac") || lower.includes("macos")) platform.push("mac");
    if (lower.includes("linux")) platform.push("linux");
    if (lower.includes("windows")) platform.push("windows");
    if (platform.length === 0) {
      if (mainCategory.includes("Linux")) platform.push("linux");
      else if (mainCategory.includes("Windows")) platform.push("windows");
      else platform.push("windows", "mac", "linux");
    }

    entries.push({
      name,
      description: description.slice(0, 500),
      category: mainCategory,
      subcategory: currentSubcategory || "General",
      url,
      platform,
      license: "Free",
    });
  }

  return entries;
}

async function getOrCreateCategory(name: string, parentId: number | null): Promise<number> {
  const existing = parentId
    ? await db.query.categories.findFirst({
        where: and(eq(categories.name, name), eq(categories.parent_id, parentId)),
      })
    : await db.query.categories.findFirst({
        where: and(eq(categories.name, name), isNull(categories.parent_id)),
      });

  if (existing) return existing.id;

  const [created] = await db.insert(categories).values({ name, parent_id: parentId }).returning();
  return created.id;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`=== Seed Software Catalog === (${dryRun ? "DRY RUN" : "LIVE"})\n`);

  const allEntries: SoftwareEntry[] = [];
  for (const source of SOURCES) {
    console.log(`Fetching ${source.category}...`);
    const res = await fetch(source.url);
    if (!res.ok) {
      console.warn(`  Failed: ${res.status}`);
      continue;
    }
    const parsed = parseReadme(await res.text(), source.category);
    console.log(`  Parsed ${parsed.length} entries`);
    allEntries.push(...parsed);
  }

  const unique = new Map<string, SoftwareEntry>();
  for (const e of allEntries) {
    const key = e.name.toLowerCase();
    if (!unique.has(key)) unique.set(key, e);
  }
  const entries = [...unique.values()];
  console.log(`\nTotal unique entries: ${entries.length}\n`);

  let adminUser = await db.query.users.findFirst({ where: eq(users.email, "admin@test.com") });
  if (!adminUser) {
    adminUser = await db.query.users.findFirst({ where: eq(users.role, "admin") });
  }
  if (!adminUser) {
    console.error("No admin user found. Run: npm run seed:demo-users");
    process.exit(1);
  }

  const usedSlugs = new Set<string>();
  const existingSlugs = await db.select({ slug: softwares.slug }).from(softwares);
  existingSlugs.forEach((r) => r.slug && usedSlugs.add(r.slug));

  let inserted = 0;
  let skipped = 0;

  const categoryCache = new Map<string, number>();

  for (const entry of entries) {
    const exists = await db.query.softwares.findFirst({ where: eq(softwares.name, entry.name) });
    if (exists) {
      skipped++;
      continue;
    }

    let parentId = categoryCache.get(entry.category);
    if (!parentId) {
      parentId = await getOrCreateCategory(entry.category, null);
      categoryCache.set(entry.category, parentId);
    }

    const subKey = `${entry.category}::${entry.subcategory}`;
    let subId = categoryCache.get(subKey);
    if (!subId) {
      const subName = `${entry.subcategory} (${entry.category})`.slice(0, 120);
      subId = await getOrCreateCategory(subName, parentId);
      categoryCache.set(subKey, subId);
    }

    let slug = slugify(entry.name) || `software-${inserted}`;
    let suffix = 1;
    while (usedSlugs.has(slug)) slug = `${slugify(entry.name)}-${suffix++}`;
    usedSlugs.add(slug);

    if (!dryRun) {
      await db.insert(softwares).values({
        name: entry.name,
        slug,
        description: entry.description,
        category_id: subId,
        platform: entry.platform,
        download_link: entry.url,
        license: entry.license || "Free",
        status: "approved",
        created_by: adminUser.id,
        seo_description: `Tải ${entry.name} miễn phí — hướng dẫn cài đặt chi tiết tiếng Việt.`,
      });
    }

    inserted++;
    if (inserted % 100 === 0) console.log(`  ... ${inserted} inserted`);
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped (duplicates)`);
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
