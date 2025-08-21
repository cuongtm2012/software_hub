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
    isFree?: boolean;
    isOpenSource?: boolean;
}

async function main() {
    console.log('Loading Awesome Windows data...');
    const dataPath = join(__dirname, 'awesome-windows-data.json');
    const data: SoftwareEntry[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

    console.log(`Loaded ${data.length} software entries`);

    // Track stats
    let subcategoriesCreated = 0;
    let softwareInserted = 0;
    let softwareSkipped = 0;

    // Get or create parent category
    const parentCategoryName = 'Windows Software';
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
        if (!bySubcategory.has(entry.subcategory)) {
            bySubcategory.set(entry.subcategory, []);
        }
        bySubcategory.get(entry.subcategory)!.push(entry);
    }

    console.log(`Found ${bySubcategory.size} subcategories`);

    // Process each subcategory
    for (const [subcategoryName, softwareEntries] of bySubcategory) {
        // Unique subcategory name
        const uniqueSubcategoryName = `${subcategoryName} (Windows)`;

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
                    license: entry.isOpenSource ? 'Open Source' : (entry.isFree ? 'Freeware' : 'Unknown'),
                    status: 'approved',
                    created_by: 1, // Admin user
                });

                softwareInserted++;

                if (softwareInserted % 50 === 0) {
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
