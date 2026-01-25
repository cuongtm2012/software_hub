import { db } from "../db";
import { sql } from "drizzle-orm";

async function runMigration() {
    try {
        console.log("🔄 Running migration: Add software_type column...");

        // Create the enum type
        await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE software_type AS ENUM ('software', 'api');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
        console.log("✅ Created software_type enum");

        // Add the type column
        await db.execute(sql`
      ALTER TABLE softwares 
      ADD COLUMN IF NOT EXISTS type software_type NOT NULL DEFAULT 'software';
    `);
        console.log("✅ Added type column to softwares table");

        // Create index
        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_softwares_type ON softwares(type);
    `);
        console.log("✅ Created index on type column");

        console.log("🎉 Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
