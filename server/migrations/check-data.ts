import { db } from "../db";
import { sql } from "drizzle-orm";

async function checkData() {
    try {
        console.log("🔍 Checking softwares data...\n");

        // Check total count
        const totalResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM softwares WHERE status = 'approved';
    `);
        console.log("Total approved softwares:", totalResult.rows[0]);

        // Check count by type
        const typeCountResult = await db.execute(sql`
      SELECT type, COUNT(*) as count 
      FROM softwares 
      WHERE status = 'approved'
      GROUP BY type;
    `);
        console.log("\nCount by type:");
        typeCountResult.rows.forEach(row => {
            console.log(`  - ${row.type}: ${row.count}`);
        });

        // Show sample data
        const sampleResult = await db.execute(sql`
      SELECT id, name, type, status 
      FROM softwares 
      WHERE status = 'approved'
      LIMIT 10;
    `);
        console.log("\nSample data (first 10):");
        sampleResult.rows.forEach(row => {
            console.log(`  [${row.type}] ${row.id}: ${row.name}`);
        });

        // Check if any APIs exist
        const apiResult = await db.execute(sql`
      SELECT id, name, type 
      FROM softwares 
      WHERE type = 'api' AND status = 'approved'
      LIMIT 5;
    `);
        console.log("\nAPI items:");
        if (apiResult.rows.length === 0) {
            console.log("  ⚠️  No API items found! All items are type='software'");
            console.log("\n💡 Suggestion: Update some items to type='api'");
        } else {
            apiResult.rows.forEach(row => {
                console.log(`  - ${row.id}: ${row.name}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

checkData();
