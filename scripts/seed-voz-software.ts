import { db } from '../server/db';
import { categories, softwares } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface VOZSoftwareEntry {
    name: string;
    version?: string;
    description: string;
    downloadLinks: string[];
    platform: string[];
    category?: string;
    vendor?: string;
    license?: string;
    sourcePost: {
        url: string;
        author: string;
        date: string;
        postNumber: number;
    };
}

async function main() {
    const args = process.argv.slice(2);
    const inputFile = args.includes('--input')
        ? args[args.indexOf('--input') + 1]
        : 'voz-software-data.json';
    const dryRun = args.includes('--dry-run');

    console.log('=== VOZ Software Database Seeder ===');
    console.log(`Input file: ${inputFile}`);
    console.log(`Dry run: ${dryRun}\n`);

    // Load data
    const dataPath = join(__dirname, inputFile);
    const data: VOZSoftwareEntry[] = JSON.parse(readFileSync(dataPath, 'utf-8'));
    console.log(`Loaded ${data.length} software entries\n`);

    // Stats
    let categoriesCreated = 0;
    let softwareInserted = 0;
    let softwareSkipped = 0;
    let errors = 0;

    // Create parent category
    let vozCategory = await db.query.categories.findFirst({
        where: eq(categories.name, 'VOZ Software Collection'),
    });

    if (!vozCategory && !dryRun) {
        console.log('Creating parent category: VOZ Software Collection');
        const [created] = await db.insert(categories).values({
            name: 'VOZ Software Collection',
        }).returning();
        vozCategory = created;
        categoriesCreated++;
    } else if (!vozCategory) {
        console.log('[DRY RUN] Would create parent category: VOZ Software Collection');
        vozCategory = { id: 999, name: 'VOZ Software Collection', parent_id: null };
    }

    // Group by category
    const byCategory = new Map<string, VOZSoftwareEntry[]>();
    for (const entry of data) {
        const cat = entry.category || 'General';
        if (!byCategory.has(cat)) {
            byCategory.set(cat, []);
        }
        byCategory.get(cat)!.push(entry);
    }

    console.log(`\nFound ${byCategory.size} categories\n`);

    // Process each category
    for (const [categoryName, entries] of byCategory) {
        const uniqueCategoryName = `${categoryName} (VOZ)`;

        // Find or create category
        let category = await db.query.categories.findFirst({
            where: and(
                eq(categories.name, uniqueCategoryName),
                eq(categories.parent_id, vozCategory.id)
            ),
        });

        if (!category && !dryRun) {
            console.log(`Creating category: ${uniqueCategoryName}`);
            const [created] = await db.insert(categories).values({
                name: uniqueCategoryName,
                parent_id: vozCategory.id,
            }).returning();
            category = created;
            categoriesCreated++;
        } else if (!category) {
            console.log(`[DRY RUN] Would create category: ${uniqueCategoryName}`);
            category = { id: 1000 + categoriesCreated, name: uniqueCategoryName, parent_id: vozCategory.id };
            categoriesCreated++;
        }

        // Insert software
        for (const entry of entries) {
            try {
                // Check for duplicates
                const existing = await db.query.softwares.findFirst({
                    where: eq(softwares.name, entry.name),
                });

                if (existing) {
                    console.log(`  ⏭️  Skipping duplicate: ${entry.name}`);
                    softwareSkipped++;
                    continue;
                }

                if (dryRun) {
                    console.log(`  [DRY RUN] Would insert: ${entry.name}`);
                    softwareInserted++;
                    continue;
                }

                // Prepare admin notes with additional info
                const adminNotes = [
                    `Imported from VOZ: ${entry.sourcePost.url}`,
                    `Author: ${entry.sourcePost.author}`,
                    `Posted: ${entry.sourcePost.date}`,
                    entry.downloadLinks.length > 1
                        ? `Additional links: ${entry.downloadLinks.slice(1).join(', ')}`
                        : ''
                ].filter(Boolean).join('\n');

                // Insert software
                await db.insert(softwares).values({
                    name: entry.name,
                    description: entry.description,
                    category_id: category.id,
                    platform: entry.platform,
                    download_link: entry.downloadLinks[0],
                    version: entry.version,
                    vendor: entry.vendor,
                    license: entry.license || 'Unknown',
                    status: 'approved',
                    created_by: 1, // Admin user
                    admin_notes: adminNotes,
                });

                console.log(`  ✅ Inserted: ${entry.name}`);
                softwareInserted++;

            } catch (error) {
                console.error(`  ❌ Error inserting ${entry.name}:`, error);
                errors++;
            }
        }
    }

    console.log('\n=== Import Complete ===');
    console.log(`Categories created: ${categoriesCreated}`);
    console.log(`Software inserted: ${softwareInserted}`);
    console.log(`Software skipped (duplicates): ${softwareSkipped}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total in data: ${data.length}`);

    if (dryRun) {
        console.log('\n⚠️  This was a DRY RUN - no data was actually inserted');
    }

    process.exit(0);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
