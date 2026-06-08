import { db } from "../server/db";
import { courses } from "../shared/schema";
import { eq, isNull } from "drizzle-orm";
import { generateCourseSlug } from "../server/lib/slug";

async function generateCourseSlugs() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`=== Generate Course Slugs === (${dryRun ? "DRY RUN" : "LIVE"})\n`);

  const allCourses = await db.select().from(courses).where(isNull(courses.slug));
  console.log(`Found ${allCourses.length} courses without slug\n`);

  const usedSlugs = new Set<string>();
  const existing = await db.select({ slug: courses.slug }).from(courses);
  existing.forEach((c) => c.slug && usedSlugs.add(c.slug));

  let updated = 0;

  for (const course of allCourses) {
    let slug = generateCourseSlug(course.title, course.topic);
    let suffix = 1;
    while (usedSlugs.has(slug)) {
      slug = `${generateCourseSlug(course.title, course.topic)}-${suffix++}`;
    }
    usedSlugs.add(slug);

    if (!dryRun) {
      await db.update(courses).set({ slug }).where(eq(courses.id, course.id));
    }
    console.log(`  ${dryRun ? "[DRY]" : "✅"} #${course.id} → /courses/${slug}`);
    updated++;
  }

  console.log(`\nDone: ${updated} slugs ${dryRun ? "would be" : ""} generated`);
  process.exit(0);
}

generateCourseSlugs().catch((err) => {
  console.error(err);
  process.exit(1);
});
