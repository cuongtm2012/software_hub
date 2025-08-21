import { db } from '../server/db';
import { categories, softwares } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MigrationMap {
    createdAt: string;
    stats: {
        totalCategories: number;
        duplicateGroups: number;
        categoriesToMerge: number;
        categoriesAfterMerge: number;
        emptyCategories: number;
        totalSoftwareAffected: number;
    };
    preserveParents: string[];
    mergeGroups: Array<{
        targetId: number;
        targetName: string;
        duplicates: Array<{
            id: number;
            name: string;
            softwareCount: number;
            parentId: number | null;
        }>;
        action: string;
        totalSoftware: number;
    }>;
}

async function migrateCategories(dryRun: boolean = true) {
    console.log('=== Category Migration Script ===');
    console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '⚠️  LIVE MIGRATION'}\n`);

    // Load migration map
    const mapPath = join(__dirname, 'category-migration-map.json');
    const migrationMap: MigrationMap = JSON.parse(readFileSync(mapPath, 'utf-8'));

    console.log('Migration Map Loaded:');
    console.log(`  Created: ${migrationMap.createdAt}`);
    console.log(`  Duplicate groups: ${migrationMap.stats.duplicateGroups}`);
    console.log(`  Categories to merge: ${migrationMap.stats.categoriesToMerge}`);
    console.log(`  Software affected: ${migrationMap.stats.totalSoftwareAffected}\n`);

    let totalRemapped = 0;
    let totalDeleted = 0;
    const errors: string[] = [];

    try {
        // Process each merge group
        for (const group of migrationMap.mergeGroups) {
            console.log(`\n📦 Processing: ${group.targetName}`);
            console.log(`   Target ID: ${group.targetId}`);

            for (const duplicate of group.duplicates) {
                console.log(`\n   Merging: ${duplicate.name} (ID: ${duplicate.id})`);
                console.log(`   Software count: ${duplicate.softwareCount}`);

                if (duplicate.softwareCount > 0) {
                    // Get software entries to remap
                    const softwareToRemap = await db.query.softwares.findMany({
                        where: eq(softwares.category_id, duplicate.id),
                    });

                    console.log(`   Found ${softwareToRemap.length} software entries to remap`);

                    if (!dryRun) {
                        // Remap software entries
                        for (const software of softwareToRemap) {
                            await db.update(softwares)
                                .set({ category_id: group.targetId })
                                .where(eq(softwares.id, software.id));
                        }
                        console.log(`   ✅ Remapped ${softwareToRemap.length} software entries`);
                    } else {
                        console.log(`   [DRY RUN] Would remap ${softwareToRemap.length} software entries`);
                    }

                    totalRemapped += softwareToRemap.length;
                }

                // Delete duplicate category
                if (!dryRun) {
                    await db.delete(categories)
                        .where(eq(categories.id, duplicate.id));
                    console.log(`   ✅ Deleted category: ${duplicate.name}`);
                } else {
                    console.log(`   [DRY RUN] Would delete category: ${duplicate.name}`);
                }

                totalDeleted++;
            }
        }

        // Delete empty categories
        console.log(`\n\n🗑️  Cleaning up empty categories...`);
        const allCategories = await db.query.categories.findMany();

        for (const cat of allCategories) {
            const softwareCount = await db.query.softwares.findMany({
                where: eq(softwares.category_id, cat.id),
            });

            if (softwareCount.length === 0 && !migrationMap.preserveParents.includes(cat.name)) {
                if (!dryRun) {
                    await db.delete(categories)
                        .where(eq(categories.id, cat.id));
                    console.log(`   ✅ Deleted empty category: ${cat.name} (ID: ${cat.id})`);
                } else {
                    console.log(`   [DRY RUN] Would delete empty category: ${cat.name} (ID: ${cat.id})`);
                }
                totalDeleted++;
            }
        }

        console.log('\n\n=== Migration Summary ===');
        console.log(`Software entries remapped: ${totalRemapped}`);
        console.log(`Categories deleted: ${totalDeleted}`);
        console.log(`Errors: ${errors.length}`);

        if (errors.length > 0) {
            console.log('\n❌ Errors encountered:');
            errors.forEach(err => console.log(`  - ${err}`));
        }

        if (dryRun) {
            console.log('\n✅ Dry run completed successfully!');
            console.log('Run with --live flag to execute migration.');
        } else {
            console.log('\n✅ Migration completed successfully!');

            // Verify results
            const finalCategories = await db.query.categories.findMany();
            const orphanedSoftware = await db.query.softwares.findMany();

            console.log('\n=== Post-Migration Verification ===');
            console.log(`Total categories: ${finalCategories.length}`);
            console.log(`Total software: ${orphanedSoftware.length}`);

            // Check for orphaned software
            let orphanCount = 0;
            for (const sw of orphanedSoftware) {
                const cat = finalCategories.find(c => c.id === sw.category_id);
                if (!cat) {
                    orphanCount++;
                    console.error(`⚠️  Orphaned software: ${sw.name} (category_id: ${sw.category_id})`);
                }
            }

            if (orphanCount === 0) {
                console.log('✅ No orphaned software found');
            } else {
                console.error(`❌ Found ${orphanCount} orphaned software entries!`);
            }
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    }

    process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--live');

migrateCategories(dryRun).catch(console.error);
