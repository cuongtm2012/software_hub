import { db } from '../server/db';
import { categories, softwares } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface APIEntry {
    name: string;
    description: string;
    category: string;
    subcategory: string;
    url: string;
}

async function main() {
    console.log('Loading Awesome APIs data...');
    const dataPath = join(__dirname, 'apis-data.json');
    const data: APIEntry[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

    console.log(`Loaded ${data.length} API entries`);

    // Track stats
    let subcategoriesCreated = 0;
    let apisInserted = 0;
    let apisSkipped = 0;

    // Get or create parent category: Development (APIs)
    const parentCategoryName = 'Development (APIs)';
    let parentCategory = await db.query.categories.findFirst({
        where: eq(categories.name, parentCategoryName),
    });

    if (!parentCategory) {
        console.log(`Creating parent category: ${parentCategoryName}`);
        const [created] = await db.insert(categories).values({
            name: parentCategoryName,
        }).returning();
        parentCategory = created;
    }

    // Group by subcategory
    const bySubcategory = new Map<string, APIEntry[]>();
    for (const entry of data) {
        if (!bySubcategory.has(entry.subcategory)) {
            bySubcategory.set(entry.subcategory, []);
        }
        bySubcategory.get(entry.subcategory)!.push(entry);
    }

    console.log(`Found ${bySubcategory.size} subcategories`);

    // Process each subcategory
    for (const [subcategoryName, apiEntries] of bySubcategory) {
        // Unique subcategory name to avoid general name conflicts
        const uniqueSubcategoryName = `${subcategoryName} (API)`;

        // Get or create subcategory
        let subcategory = await db.query.categories.findFirst({
            where: and(
                eq(categories.name, uniqueSubcategoryName),
                eq(categories.parent_id, parentCategory.id)
            ),
        });

        if (!subcategory) {
            console.log(`  Creating subcategory: ${uniqueSubcategoryName}`);
            const [created] = await db.insert(categories).values({
                name: uniqueSubcategoryName,
                parent_id: parentCategory.id,
            }).returning();
            subcategory = created;
            subcategoriesCreated++;
        }

        // Insert API entries
        for (const entry of apiEntries) {
            // Check if API already exists (by name and category to allow same name in different subcategories if needed, but usually name is unique enough)
            const existing = await db.query.softwares.findFirst({
                where: eq(softwares.name, entry.name),
            });

            if (existing) {
                apisSkipped++;
                continue;
            }

            try {
                await db.insert(softwares).values({
                    name: entry.name,
                    description: entry.description,
                    category_id: subcategory.id,
                    download_link: entry.url,
                    platform: ['Web'], // APIs are web-based
                    license: 'Open Tools',
                    status: 'approved',
                    created_by: 1, // Admin user
                });

                apisInserted++;

                if (apisInserted % 50 === 0) {
                    console.log(`  Inserted ${apisInserted} APIs...`);
                }
            } catch (error) {
                console.error(`  Error inserting ${entry.name}:`, error);
            }
        }
    }

    console.log('\n=== Import Complete ===');
    console.log(`Subcategories created: ${subcategoriesCreated}`);
    console.log(`APIs inserted: ${apisInserted}`);
    console.log(`APIs skipped (duplicates): ${apisSkipped}`);

    process.exit(0);
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
