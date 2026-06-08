import { db } from "../server/db";
import { softwares } from "../shared/schema";
import { eq, isNull } from "drizzle-orm";
import { slugify } from "../server/lib/slug";

async function generateSoftwareSlugs() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`=== Generate Software Slugs === (${dryRun ? "DRY RUN" : "LIVE"})\n`);

  const allSoftware = await db.select().from(softwares).where(isNull(softwares.slug));
  console.log(`Found ${allSoftware.length} software without slug\n`);

  const usedSlugs = new Set<string>();
  const existing = await db.select({ slug: softwares.slug }).from(softwares);
  existing.forEach((s) => s.slug && usedSlugs.add(s.slug));

  let updated = 0;

  for (const sw of allSoftware) {
    let slug = slugify(sw.name) || `software-${sw.id}`;
    let suffix = 1;
    while (usedSlugs.has(slug)) {
      slug = `${slugify(sw.name)}-${suffix++}`;
    }
    usedSlugs.add(slug);

    if (!dryRun) {
      await db.update(softwares).set({ slug }).where(eq(softwares.id, sw.id));
    }
    console.log(`  ${dryRun ? "[DRY]" : "✅"} #${sw.id} → /software/${slug}`);
    updated++;
  }

  console.log(`\nDone: ${updated} slugs ${dryRun ? "would be" : ""} generated`);
  process.exit(0);
}

generateSoftwareSlugs().catch((err) => {
  console.error(err);
  process.exit(1);
});
