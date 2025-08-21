import { db } from '../server/db';
import { categories, softwares } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SoftwareEntry {
    name: string;
    description: string;
    category: string;
    subcategory: string;
    url: string;
    platform: string[];
    isOpenSource?: boolean;
    isRecommended?: boolean;
}

async function main() {
    console.log('Loading Awesome Free Apps data...');
    const dataPath = join(__dirname, 'free-apps-data.json');
    const data: SoftwareEntry[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

    console.log(`Loaded ${data.length} software entries`);

    // Track stats
    let subcategoriesCreated = 0;
    let softwareInserted = 0;
    let softwareSkipped = 0;

    // Get or create parent category: Free Applications
    const parentCategoryName = 'Free Applications';
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
    const bySubcategory = new Map<string, SoftwareEntry[]>();
    for (const entry of data) {
        // Skip "Contents" subcategory (table of contents)
        if (entry.subcategory === 'Contents') continue;

        if (!bySubcategory.has(entry.subcategory)) {
            bySubcategory.set(entry.subcategory, []);
        }
        bySubcategory.get(entry.subcategory)!.push(entry);
    }

    console.log(`Found ${bySubcategory.size} subcategories`);

    // Process each subcategory
    for (const [subcategoryName, softwareEntries] of bySubcategory) {
        // Unique subcategory name
        const uniqueSubcategoryName = `${subcategoryName} (Free Apps)`;

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

        // Insert software entries
        for (const entry of softwareEntries) {
            // Check if software already exists
            const existing = await db.query.softwares.findFirst({
                where: eq(softwares.name, entry.name),
            });

            if (existing) {
                softwareSkipped++;
                continue;
            }

            try {
                await db.insert(softwares).values({
                    name: entry.name,
                    description: entry.description,
                    category_id: subcategory.id,
                    download_link: entry.url,
                    platform: entry.platform,
                    license: entry.isOpenSource ? 'Open Source' : 'Freeware',
                    status: 'approved',
                    created_by: 1, // Admin user
                    admin_notes: entry.isRecommended ? 'Recommended by awesome-free-apps' : undefined,
                });

                softwareInserted++;

                if (softwareInserted % 100 === 0) {
                    console.log(`  Inserted ${softwareInserted} software...`);
                }
            } catch (error) {
                console.error(`  Error inserting ${entry.name}:`, error);
            }
        }
    }

    console.log('\n=== Import Complete ===');
    console.log(`Subcategories created: ${subcategoriesCreated}`);
    console.log(`Software inserted: ${softwareInserted}`);
    console.log(`Software skipped (duplicates): ${softwareSkipped}`);

    process.exit(0);
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
