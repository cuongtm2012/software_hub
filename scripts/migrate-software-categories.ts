/**
 * Re-map software categories from source/platform buckets → user need taxonomy.
 * Run: npm run migrate:software-categories
 *      npm run migrate:software-categories -- --dry-run
 */
import { eq, inArray, sql } from "drizzle-orm";
import { db, pool } from "../server/db";
import { categories, softwares } from "../shared/schema";
import {
  SOFTWARE_USE_CATEGORIES,
  extractLegacySubcategory,
  resolveUseCategorySlug,
} from "../shared/software-category-taxonomy.js";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`=== Migrate software categories === (${dryRun ? "DRY RUN" : "LIVE"})\n`);

  const slugToId = new Map<string, number>();

  for (const cat of SOFTWARE_USE_CATEGORIES) {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.name, cat.name),
    });
    if (existing) {
      slugToId.set(cat.slug, existing.id);
      if (!dryRun && existing.parent_id !== null) {
        await db.update(categories).set({ parent_id: null }).where(eq(categories.id, existing.id));
      }
      continue;
    }
    if (!dryRun) {
      const [created] = await db
        .insert(categories)
        .values({ name: cat.name, parent_id: null })
        .returning();
      slugToId.set(cat.slug, created.id);
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`[DRY] Would create: ${cat.name}`);
    }
  }

  if (dryRun) {
    // Re-fetch for dry-run stats only
    for (const cat of SOFTWARE_USE_CATEGORIES) {
      const existing = await db.query.categories.findFirst({
        where: eq(categories.name, cat.name),
      });
      if (existing) slugToId.set(cat.slug, existing.id);
    }
  }

  const allSoftware = await db
    .select({ id: softwares.id, category_id: softwares.category_id })
    .from(softwares);

  const categoryRows = await db.select().from(categories);
  const categoryById = new Map(categoryRows.map((c) => [c.id, c]));

  const stats = new Map<string, number>();
  let updated = 0;

  for (const row of allSoftware) {
    const current = categoryById.get(row.category_id);
    if (!current) continue;

    const subLabel = extractLegacySubcategory(current.name);
    const slug = resolveUseCategorySlug(subLabel);
    stats.set(slug, (stats.get(slug) ?? 0) + 1);

    const targetId = slugToId.get(slug);
    if (!targetId || targetId === row.category_id) continue;

    if (!dryRun) {
      await db
        .update(softwares)
        .set({ category_id: targetId })
        .where(eq(softwares.id, row.id));
    }
    updated++;
  }

  console.log("\n=== Distribution ===");
  for (const cat of SOFTWARE_USE_CATEGORIES) {
    console.log(`  ${cat.name}: ${stats.get(cat.slug) ?? 0}`);
  }
  console.log(`\n${dryRun ? "Would update" : "Updated"}: ${updated} software rows`);

  if (!dryRun) {
    const legacyParents = categoryRows.filter(
      (c) =>
        c.parent_id === null &&
        !SOFTWARE_USE_CATEGORIES.some((t) => t.name === c.name),
    );
    const legacyIds = legacyParents.map((c) => c.id);
    const childIds = categoryRows
      .filter((c) => c.parent_id && legacyIds.includes(c.parent_id))
      .map((c) => c.id);
    const orphanIds = [...legacyIds, ...childIds];

    if (orphanIds.length > 0) {
      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(softwares)
        .where(inArray(softwares.category_id, orphanIds));
      if (Number(count) === 0) {
        await db.delete(categories).where(inArray(categories.id, orphanIds));
        console.log(`Removed ${orphanIds.length} unused legacy categories`);
      } else {
        console.warn(`Legacy categories kept — ${count} software still reference them`);
      }
    }
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
