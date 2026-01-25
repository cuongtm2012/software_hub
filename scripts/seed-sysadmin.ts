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
    sourceUrl?: string;
    license?: string;
    language?: string;
    isOpenSource: boolean;
    isFree: boolean;
    platform: string[];
}

async function main() {
    console.log('Loading sysadmin software data...');
    const dataPath = join(__dirname, 'sysadmin-data.json');
    const data: SoftwareEntry[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

    console.log(`Loaded ${data.length} software entries`);

    // Get or create parent category
    let parentCategory = await db.query.categories.findFirst({
        where: eq(categories.name, 'System Administration'),
    });

    if (!parentCategory) {
        console.log('Creating parent category: System Administration');
        const [created] = await db.insert(categories).values({
            name: 'System Administration',
        }).returning();
        parentCategory = created;
    }

    console.log(`Parent category ID: ${parentCategory.id}`);

    // Track stats
    let categoriesCreated = 0;
    let softwareInserted = 0;
    let softwareSkipped = 0;

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
    for (const [subcategoryName, entries] of bySubcategory) {
        // Create unique category name by combining with parent
        const uniqueName = `${subcategoryName} (SysAdmin)`;

        // Get or create subcategory
        let subcategory = await db.query.categories.findFirst({
            where: and(
                eq(categories.name, uniqueName),
                eq(categories.parent_id, parentCategory.id)
            ),
        });

        if (!subcategory) {
            console.log(`Creating subcategory: ${uniqueName}`);
            const [created] = await db.insert(categories).values({
                name: uniqueName,
                parent_id: parentCategory.id,
            }).returning();
            subcategory = created;
            categoriesCreated++;
        }

        // Insert software entries
        for (const entry of entries) {
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
                    download_link: entry.sourceUrl || entry.url,
                    image_url: null,
                    version: null,
                    platform: entry.platform,
                    license: entry.license || 'Unknown',
                    status: 'approved',
                    created_by: 1, // Admin user
                });

                softwareInserted++;

                if (softwareInserted % 50 === 0) {
                    console.log(`Inserted ${softwareInserted} software entries...`);
                }
            } catch (error) {
                console.error(`Error inserting ${entry.name}:`, error);
            }
        }
    }

    console.log('\n=== Import Complete ===');
    console.log(`Categories created: ${categoriesCreated}`);
    console.log(`Software inserted: ${softwareInserted}`);
    console.log(`Software skipped (duplicates): ${softwareSkipped}`);
    console.log(`Total software in data: ${data.length}`);

    process.exit(0);
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
