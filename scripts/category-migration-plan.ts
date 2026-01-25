import { db } from '../server/db';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CategoryWithCount {
    id: number;
    name: string;
    parent_id: number | null;
    softwareCount: number;
}

interface MergeGroup {
    targetId: number;
    targetName: string;
    duplicates: Array<{
        id: number;
        name: string;
        softwareCount: number;
        parentId: number | null;
    }>;
    action: 'merge_to_target';
    totalSoftware: number;
}

async function createMigrationMapping() {
    console.log('=== Creating Category Migration Mapping ===\n');

    // Get all categories with software count
    const allCategories = await db.query.categories.findMany();

    const categoriesWithCount: CategoryWithCount[] = await Promise.all(
        allCategories.map(async (cat) => {
            const softwareList = await db.query.softwares.findMany({
                where: (softwares, { eq }) => eq(softwares.category_id, cat.id),
            });
            return {
                id: cat.id,
                name: cat.name,
                parent_id: cat.parent_id,
                softwareCount: softwareList.length,
            };
        })
    );

    console.log(`Analyzed ${categoriesWithCount.length} categories\n`);

    // Group by base name (removing source suffixes)
    const byBaseName = new Map<string, CategoryWithCount[]>();

    categoriesWithCount.forEach(cat => {
        const baseName = cat.name
            .replace(/\s*\((API|Windows|Free Apps|VOZ|Software Patreons|Official Statistics Software)\)\s*$/gi, '')
            .trim();

        if (!byBaseName.has(baseName)) {
            byBaseName.set(baseName, []);
        }
        byBaseName.get(baseName)!.push(cat);
    });

    // Create merge groups for duplicates
    const mergeGroups: MergeGroup[] = [];
    const preserveParents = new Set<string>();

    byBaseName.forEach((cats, baseName) => {
        if (cats.length > 1) {
            // Sort by: 1) has software (desc), 2) is parent category (desc), 3) shortest name
            cats.sort((a, b) => {
                if (a.softwareCount !== b.softwareCount) {
                    return b.softwareCount - a.softwareCount;
                }
                if ((a.parent_id === null ? 1 : 0) !== (b.parent_id === null ? 1 : 0)) {
                    return (b.parent_id === null ? 1 : 0) - (a.parent_id === null ? 1 : 0);
                }
                return a.name.length - b.name.length;
            });

            const target = cats[0];
            const duplicates = cats.slice(1);

            // Track parent categories to preserve
            cats.forEach(cat => {
                if (cat.parent_id !== null) {
                    const parent = allCategories.find(c => c.id === cat.parent_id);
                    if (parent) {
                        preserveParents.add(parent.name);
                    }
                }
            });

            mergeGroups.push({
                targetId: target.id,
                targetName: target.name,
                duplicates: duplicates.map(d => ({
                    id: d.id,
                    name: d.name,
                    softwareCount: d.softwareCount,
                    parentId: d.parent_id,
                })),
                action: 'merge_to_target',
                totalSoftware: cats.reduce((sum, c) => sum + c.softwareCount, 0),
            });
        }
    });

    // Sort merge groups by total software count (descending)
    mergeGroups.sort((a, b) => b.totalSoftware - a.totalSoftware);

    // Calculate stats
    const stats = {
        totalCategories: categoriesWithCount.length,
        duplicateGroups: mergeGroups.length,
        categoriesToMerge: mergeGroups.reduce((sum, g) => sum + g.duplicates.length, 0),
        categoriesAfterMerge: categoriesWithCount.length - mergeGroups.reduce((sum, g) => sum + g.duplicates.length, 0),
        emptyCategories: categoriesWithCount.filter(c => c.softwareCount === 0).length,
        totalSoftwareAffected: mergeGroups.reduce((sum, g) => sum + g.duplicates.reduce((s, d) => s + d.softwareCount, 0), 0),
    };

    // Create migration map
    const migrationMap = {
        createdAt: new Date().toISOString(),
        stats,
        preserveParents: Array.from(preserveParents).sort(),
        mergeGroups,
    };

    // Save to file
    const outputPath = join(__dirname, 'category-migration-map.json');
    writeFileSync(outputPath, JSON.stringify(migrationMap, null, 2));

    console.log('=== Migration Mapping Summary ===');
    console.log(`Total categories: ${stats.totalCategories}`);
    console.log(`Duplicate groups found: ${stats.duplicateGroups}`);
    console.log(`Categories to merge: ${stats.categoriesToMerge}`);
    console.log(`Categories after merge: ${stats.categoriesAfterMerge}`);
    console.log(`Empty categories: ${stats.emptyCategories}`);
    console.log(`Software entries affected: ${stats.totalSoftwareAffected}`);
    console.log(`\nParent categories to preserve: ${preserveParents.size}`);
    preserveParents.forEach(p => console.log(`  - ${p}`));

    console.log(`\nTop 10 merge groups by software count:`);
    mergeGroups.slice(0, 10).forEach(g => {
        console.log(`\n${g.targetName} (${g.totalSoftware} software):`);
        console.log(`  Target: ${g.targetName} (ID: ${g.targetId})`);
        g.duplicates.forEach(d => {
            console.log(`  Merge: ${d.name} (ID: ${d.id}, ${d.softwareCount} software)`);
        });
    });

    console.log(`\n✅ Migration map saved to: ${outputPath}`);

    process.exit(0);
}

createMigrationMapping().catch(console.error);
