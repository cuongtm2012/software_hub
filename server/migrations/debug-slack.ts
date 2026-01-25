import { db } from "../db";
import { sql } from "drizzle-orm";

async function debugSlack() {
    try {
        console.log("🔍 Checking Slack item...\n");

        // Check Slack specifically
        const slackResult = await db.execute(sql`
      SELECT id, name, type, status, description
      FROM softwares 
      WHERE name ILIKE '%Slack%'
      LIMIT 5;
    `);

        console.log("Slack items found:");
        slackResult.rows.forEach(row => {
            console.log(`  ID: ${row.id}`);
            console.log(`  Name: ${row.name}`);
            console.log(`  Type: ${row.type}`);
            console.log(`  Status: ${row.status}`);
            console.log(`  Description: ${row.description?.substring(0, 100)}...`);
            console.log("");
        });

        // Test the actual API query
        console.log("\n🔍 Testing API query (type='api', limit=18)...\n");
        const apiQueryResult = await db.execute(sql`
      SELECT id, name, type
      FROM softwares 
      WHERE type = 'api' AND status = 'approved'
      ORDER BY id
      LIMIT 18;
    `);

        console.log("API query results:");
        apiQueryResult.rows.forEach((row, index) => {
            console.log(`  ${index + 1}. [${row.id}] ${row.name} (type: ${row.type})`);
        });

        // Check if Slack appears in API results
        const slackInApi = apiQueryResult.rows.find(row => row.name.toLowerCase().includes('slack'));
        if (slackInApi) {
            console.log("\n⚠️  WARNING: Slack found in API results!");
            console.log(`  This should NOT happen. Slack type: ${slackInApi.type}`);
        } else {
            console.log("\n✅ Slack NOT found in API results (correct!)");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

debugSlack();
