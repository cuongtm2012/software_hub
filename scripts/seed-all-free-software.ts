/**
 * Merge parsed JSON → insert/update softwares on Supabase (production-safe, idempotent).
 * Run: npm run seed:free-software
 *      npm run seed:free-software -- --dry-run
 */
import { eq } from "drizzle-orm";
import { existsSync } from "fs";
import { join } from "path";
import { db, pool } from "../server/db";
import { softwares } from "../shared/schema";
import { slugify } from "../server/lib/slug";
import {
  DATA_DIR,
  type FreeSoftwareEntry,
  type ParsedSoftwareBundle,
  getOrCreateCategory,
  getSeedAdminUserId,
  readJson,
} from "./lib/data-expansion.js";
import {
  SOFTWARE_USE_CATEGORIES,
  resolveUseCategorySlug,
} from "../shared/software-category-taxonomy.js";

const DATA_FILES = [
  "awesome-free-apps.json",
  "awesome-selfhosted.json",
  "downloadcomvn.json",
] as const;

function loadEntries(): FreeSoftwareEntry[] {
  const all: FreeSoftwareEntry[] = [];
  for (const file of DATA_FILES) {
    const path = join(DATA_DIR, file);
    if (!existsSync(path)) {
      console.warn(`⏭  Skip missing ${file} — run parse script first`);
      continue;
    }
    const bundle = readJson<ParsedSoftwareBundle>(file);
    all.push(...bundle.entries);
    console.log(`Loaded ${bundle.entries.length} from ${file}`);
  }
  return all;
}

function adminNotes(entry: FreeSoftwareEntry): string | undefined {
  const parts = [`source:${entry.source}`];
  if (entry.essential) parts.push("essential");
  return parts.join(" ");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`=== Seed Free Software === (${dryRun ? "DRY RUN" : "LIVE"})\n`);

  const rawEntries = loadEntries();
  if (rawEntries.length === 0) {
    console.error("No data files found. Run: npm run data:parse");
    process.exit(1);
  }

  const unique = new Map<string, FreeSoftwareEntry>();
  for (const e of rawEntries) {
    const key = e.name.toLowerCase();
    if (!unique.has(key)) unique.set(key, e);
  }
  const entries = [...unique.values()];
  console.log(`\nTotal unique entries: ${entries.length}\n`);

  const adminId = await getSeedAdminUserId();
  const categoryCache = new Map<string, number>();
  const usedSlugs = new Set<string>();
  const existingSlugs = await db.select({ slug: softwares.slug }).from(softwares);
  existingSlugs.forEach((r) => r.slug && usedSlugs.add(r.slug));

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  const useCategoryBySlug = new Map(
    SOFTWARE_USE_CATEGORIES.map((c) => [c.slug, c.name]),
  );

  for (const entry of entries) {
    const existing = await db.query.softwares.findFirst({
      where: eq(softwares.name, entry.name),
    });

    const useSlug = resolveUseCategorySlug(entry.subcategory || entry.category);
    const useName = useCategoryBySlug.get(useSlug) ?? "Khác";
    let categoryId = categoryCache.get(useSlug);
    if (!categoryId) {
      categoryId = await getOrCreateCategory(useName, null);
      categoryCache.set(useSlug, categoryId);
    }

    if (existing) {
      if (!dryRun) {
        await db
          .update(softwares)
          .set({
            description: entry.description,
            download_link: entry.download_link || entry.url,
            platform: entry.platform,
            license: entry.license,
            vendor: entry.vendor,
            version: entry.version,
            image_url: entry.image_url ?? undefined,
            documentation_link: entry.documentation_link,
            admin_notes: adminNotes(entry),
            status: "approved",
          })
          .where(eq(softwares.id, existing.id));
      }
      updated++;
      continue;
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
        seo_description: `Tải ${entry.name} miễn phí — ${entry.subcategory}.`,
        category_id: categoryId,
        platform: entry.platform,
        download_link: entry.download_link || entry.url,
        image_url: entry.image_url ?? undefined,
        version: entry.version,
        vendor: entry.vendor,
        license: entry.license || "Free",
        documentation_link: entry.documentation_link,
        admin_notes: adminNotes(entry),
        status: "approved",
        created_by: adminId,
      });
    }

    inserted++;
    if (inserted % 200 === 0) console.log(`  ... ${inserted} inserted`);
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
