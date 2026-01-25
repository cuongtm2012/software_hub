import { db } from "../db";
import { sql } from "drizzle-orm";

async function updateApiItems() {
    try {
        console.log("🔄 Updating items to type='api' based on name/description...\n");

        // Find items that should be APIs
        const candidatesResult = await db.execute(sql`
      SELECT id, name, description
      FROM softwares 
      WHERE status = 'approved'
        AND type = 'software'
        AND (
          name ILIKE '%API%' 
          OR name ILIKE '%REST%'
          OR name ILIKE '%GraphQL%'
          OR name ILIKE '%SDK%'
          OR description ILIKE '%API%'
          OR description ILIKE '%REST%'
          OR description ILIKE '%GraphQL%'
        )
      LIMIT 50;
    `);

        console.log(`Found ${candidatesResult.rows.length} potential API items:\n`);

        if (candidatesResult.rows.length === 0) {
            console.log("⚠️  No items found matching API criteria.");
            console.log("\n💡 Creating sample API items for testing...\n");

            // Create sample API items
            const sampleApis = [
                {
                    name: "OpenWeather API",
                    description: "Weather data API with current conditions and forecasts"
                },
                {
                    name: "Google Maps API",
                    description: "Maps, geocoding, and location services API"
                },
                {
                    name: "Stripe Payment API",
                    description: "Payment processing and billing API"
                },
                {
                    name: "Twilio SMS API",
                    description: "SMS and voice communication API"
                },
                {
                    name: "SendGrid Email API",
                    description: "Email delivery and marketing API"
                }
            ];

            for (const api of sampleApis) {
                await db.execute(sql`
          INSERT INTO softwares (name, description, type, category_id, platform, download_link, created_by, status)
          VALUES (
            ${api.name},
            ${api.description},
            'api',
            2,
            ARRAY['web'],
            'https://example.com',
            1,
            'approved'
          )
          ON CONFLICT DO NOTHING;
        `);
                console.log(`  ✅ Created: ${api.name}`);
            }

            console.log(`\n🎉 Created ${sampleApis.length} sample API items!`);
        } else {
            // Update existing items
            candidatesResult.rows.forEach((row, index) => {
                console.log(`  ${index + 1}. [ID: ${row.id}] ${row.name}`);
            });

            console.log("\n🔄 Updating these items to type='api'...");

            const updateResult = await db.execute(sql`
        UPDATE softwares 
        SET type = 'api'
        WHERE status = 'approved'
          AND type = 'software'
          AND (
            name ILIKE '%API%' 
            OR name ILIKE '%REST%'
            OR name ILIKE '%GraphQL%'
            OR name ILIKE '%SDK%'
            OR description ILIKE '%API%'
            OR description ILIKE '%REST%'
            OR description ILIKE '%GraphQL%'
          );
      `);

            console.log(`\n✅ Updated ${updateResult.rowCount} items to type='api'`);
        }

        // Verify the update
        const verifyResult = await db.execute(sql`
      SELECT type, COUNT(*) as count 
      FROM softwares 
      WHERE status = 'approved'
      GROUP BY type;
    `);

        console.log("\n📊 Final count by type:");
        verifyResult.rows.forEach(row => {
            console.log(`  - ${row.type}: ${row.count}`);
        });

        // Show some API examples
        const apiExamples = await db.execute(sql`
      SELECT id, name 
      FROM softwares 
      WHERE type = 'api' AND status = 'approved'
      LIMIT 10;
    `);

        console.log("\n🔍 Sample API items:");
        apiExamples.rows.forEach(row => {
            console.log(`  - [${row.id}] ${row.name}`);
        });

        console.log("\n🎉 Update completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

updateApiItems();
