/**
 * Seed IT courses from EbookFoundation + manual YouTube channels.
 * Run: npm run seed:courses-v2
 */
import { existsSync } from "fs";
import { join } from "path";
import { db, pool } from "../server/db";
import { courses } from "../shared/schema";
import { generateCourseSlug } from "../server/lib/slug";
import {
  DATA_DIR,
  type CourseTopicBundle,
  readJson,
} from "./lib/data-expansion.js";

const SOURCES = ["ebookfoundation-courses.json", "youtube-channels.json"] as const;

function loadTopics(): CourseTopicBundle[] {
  const topics: CourseTopicBundle[] = [];
  for (const file of SOURCES) {
    const path = join(DATA_DIR, file);
    if (!existsSync(path)) {
      console.warn(`⏭  Skip missing ${file}`);
      continue;
    }
    const data = readJson<CourseTopicBundle[]>(file);
    topics.push(...data);
    const count = data.reduce((n, t) => n + t.courses.length, 0);
    console.log(`Loaded ${count} courses from ${file}`);
  }
  return topics;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`=== Seed IT Courses v2 === (${dryRun ? "DRY RUN" : "LIVE"})\n`);

  const topicsData = loadTopics();
  if (topicsData.length === 0) {
    console.error("No course data. Run: npm run parse:ebookfoundation");
    process.exit(1);
  }

  let imported = 0;
  let skipped = 0;
  const seenUrls = new Set<string>();
  const usedSlugs = new Set<string>();
  const existingSlugs = await db.select({ slug: courses.slug }).from(courses);
  existingSlugs.forEach((r) => r.slug && usedSlugs.add(r.slug));

  for (const topicData of topicsData) {
    console.log(`\n📚 ${topicData.topic} (${topicData.courses.length} courses)`);

    for (const course of topicData.courses) {
      if (seenUrls.has(course.youtubeUrl)) {
        skipped++;
        continue;
      }
      seenUrls.add(course.youtubeUrl);

      const existing = await db.query.courses.findFirst({
        where: (c, { eq }) => eq(c.youtube_url, course.youtubeUrl),
      });

      if (existing) {
        skipped++;
        continue;
      }

      if (!dryRun) {
        let slug = generateCourseSlug(course.title, topicData.topic);
        let suffix = 1;
        while (usedSlugs.has(slug)) {
          slug = `${generateCourseSlug(course.title, topicData.topic)}-${suffix++}`;
        }
        usedSlugs.add(slug);

        await db.insert(courses).values({
          slug,
          title: course.title,
          description: `Khóa học ${topicData.topic} bằng tiếng Việt`,
          topic: topicData.topic,
          instructor: course.instructor || "Unknown",
          youtube_url: course.youtubeUrl,
          playlist_id: course.playlistId,
          thumbnail_url: course.thumbnailUrl,
          level: course.level,
          language: "vi",
          status: "approved",
        });
      }

      imported++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
