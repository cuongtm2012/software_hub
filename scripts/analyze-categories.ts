import { db } from '../server/db';

async function analyzeCategoriesForMigration() {
    console.log('=== Categories Analysis for Migration ===\n');

    // Get all categories
    const allCategories = await db.query.categories.findMany();
    console.log(`Total categories: ${allCategories.length}\n`);

    // Group by base name (removing suffixes like (API), (Windows), etc.)
    const byBaseName = new Map<string, typeof allCategories>();

    allCategories.forEach(cat => {
        const baseName = cat.name
            .replace(/\s*\((API|Windows|Free Apps|VOZ|Software Patreons|Official Statistics Software)\)\s*$/gi, '')
            .trim();

        if (!byBaseName.has(baseName)) {
            byBaseName.set(baseName, []);
        }
        byBaseName.get(baseName)!.push(cat);
    });

    // Find duplicates
    const duplicates = Array.from(byBaseName.entries())
        .filter(([_, cats]) => cats.length > 1)
        .sort((a, b) => b[1].length - a[1].length);

    console.log(`Potential duplicate base names: ${duplicates.length}\n`);
    console.log('Top 30 duplicates:\n');

    duplicates.slice(0, 30).forEach(([baseName, cats]) => {
        console.log(`${baseName} (${cats.length} variants):`);
        cats.forEach(cat => {
            console.log(`  - ${cat.name} (ID: ${cat.id}, parent: ${cat.parent_id})`);
        });
        console.log('');
    });

    // Count software per category
    const categoriesWithCount = await Promise.all(
        allCategories.map(async (cat) => {
            const softwareCount = await db.query.softwares.findMany({
                where: (softwares, { eq }) => eq(softwares.category_id, cat.id),
            });
            return { ...cat, softwareCount: softwareCount.length };
        })
    );

    const categoriesWithSoftware = categoriesWithCount.filter(c => c.softwareCount > 0);
    const emptyCategories = categoriesWithCount.filter(c => c.softwareCount === 0);

    console.log(`\nCategories with software: ${categoriesWithSoftware.length}`);
    console.log(`Empty categories: ${emptyCategories.length}\n`);

    // Parent categories
    const parentCategories = allCategories.filter(c => c.parent_id === null);
    console.log(`Parent categories: ${parentCategories.length}`);
    parentCategories.forEach(p => {
        const children = allCategories.filter(c => c.parent_id === p.id);
        console.log(`  - ${p.name} (${children.length} subcategories)`);
    });

    process.exit(0);
}

analyzeCategoriesForMigration().catch(console.error);
