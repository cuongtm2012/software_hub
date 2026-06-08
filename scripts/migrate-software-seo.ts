import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Adding software slug + SEO columns...");
  await db.execute(sql`
    ALTER TABLE softwares
      ADD COLUMN IF NOT EXISTS slug text UNIQUE,
      ADD COLUMN IF NOT EXISTS seo_description text,
      ADD COLUMN IF NOT EXISTS seo_content text;
  `);
  console.log("Done.");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
