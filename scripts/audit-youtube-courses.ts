/**
 * Validate course YouTube URLs via oEmbed; hide broken links and refresh thumbnails.
 * Run: npm run audit:youtube-courses
 *      npm run audit:youtube-courses -- --dry-run
 */
import { eq } from "drizzle-orm";
import { db, pool } from "../server/db";
import { courses } from "../shared/schema";
import { fetchYouTubeOEmbed } from "../shared/youtube-utils.js";

const DELAY_MS = 350;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`=== Audit YouTube courses === (${dryRun ? "DRY RUN" : "LIVE"})\n`);

  const rows = await db.select().from(courses);
  let valid = 0;
  let invalid = 0;
  let thumbUpdated = 0;

  for (const course of rows) {
    const result = await fetchYouTubeOEmbed(course.youtube_url);
    await sleep(DELAY_MS);

    if (!result.ok) {
      invalid++;
      console.log(`❌ [${course.id}] ${course.title}`);
      if (!dryRun) {
        await db
          .update(courses)
          .set({ status: "rejected", updated_at: new Date() })
          .where(eq(courses.id, course.id));
      }
      continue;
    }

    valid++;
    const needsThumb =
      result.thumbnailUrl &&
      (!course.thumbnail_url || course.thumbnail_url.includes(`/vi/${course.playlist_id}/`));

    if (needsThumb) {
      thumbUpdated++;
      if (!dryRun) {
        await db
          .update(courses)
          .set({
            thumbnail_url: result.thumbnailUrl,
            updated_at: new Date(),
            status: course.status === "rejected" ? "approved" : course.status,
          })
          .where(eq(courses.id, course.id));
      }
    } else if (!dryRun && course.status === "rejected") {
      await db
        .update(courses)
        .set({ status: "approved", updated_at: new Date() })
        .where(eq(courses.id, course.id));
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Valid: ${valid}`);
  console.log(`Invalid (hidden): ${invalid}`);
  console.log(`Thumbnails refreshed: ${thumbUpdated}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
