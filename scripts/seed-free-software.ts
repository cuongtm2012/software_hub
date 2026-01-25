import { db } from "../server/db";
import { categories, softwares, users } from "../shared/schema";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { eq } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SoftwareEntry {
    name: string;
    description: string;
    category: string;
    subcategory: string;
    url: string;
    isOpenSource: boolean;
    isFree: boolean;
    sourceUrl?: string;
    license?: string;
}

async function seedFreeSoftwareData() {
    console.log('🌱 Starting free software data seeding...\n');

    // Read parsed data
    const dataPath = path.join(__dirname, 'free-software-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const entries: SoftwareEntry[] = JSON.parse(rawData);

    console.log(`📦 Loaded ${entries.length} software entries\n`);

    // Get admin user
    let adminUser = await db.query.users.findFirst({
        where: eq(users.role, 'admin')
    });

    if (!adminUser) {
        console.log('Creating admin user...');
        const [newAdmin] = await db.insert(users).values({
            name: 'System Admin',
            email: 'admin@softwarehub.com',
            password: 'hashed_password',
            role: 'admin',
        }).returning();
        adminUser = newAdmin;
        console.log('✓ Admin user created\n');
    }

    // Group entries by category
    const categoryMap = new Map<string, number>();
    const subcategoryMap = new Map<string, number>();

    console.log('📁 Creating/updating categories...');

    // Get unique categories and subcategories
    const uniqueCategories = new Set<string>();
    const uniqueSubcategories = new Map<string, string>();

    entries.forEach(entry => {
        if (entry.category) {
            uniqueCategories.add(entry.category);
            if (entry.subcategory) {
                uniqueSubcategories.set(entry.subcategory, entry.category);
            }
        }
    });

    // Insert/get parent categories
    for (const categoryName of uniqueCategories) {
        const existing = await db.query.categories.findFirst({
            where: eq(categories.name, categoryName)
        });

        if (!existing) {
            const [newCategory] = await db.insert(categories).values({
                name: categoryName,
                parent_id: null,
            }).returning();
            categoryMap.set(categoryName, newCategory.id);
        } else {
            categoryMap.set(categoryName, existing.id);
        }
    }

    // Insert/get subcategories
    for (const [subcategoryName, parentName] of uniqueSubcategories) {
        const parentId = categoryMap.get(parentName);
        if (!parentId) continue;

        const existing = await db.query.categories.findFirst({
            where: eq(categories.name, subcategoryName)
        });

        if (!existing) {
            const [newSubcategory] = await db.insert(categories).values({
                name: subcategoryName,
                parent_id: parentId,
            }).returning();
            subcategoryMap.set(subcategoryName, newSubcategory.id);
        } else {
            subcategoryMap.set(subcategoryName, existing.id);
        }
    }

    console.log(`✓ Processed ${categoryMap.size} parent categories`);
    console.log(`✓ Processed ${subcategoryMap.size} subcategories\n`);

    // Insert software entries
    console.log('💾 Inserting software entries...');
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const entry of entries) {
        try {
            // Determine category ID
            let categoryId: number | undefined;
            if (entry.subcategory) {
                categoryId = subcategoryMap.get(entry.subcategory);
            }
            if (!categoryId && entry.category) {
                categoryId = categoryMap.get(entry.category);
            }

            if (!categoryId) {
                console.warn(`⚠️  Skipping ${entry.name}: No category found`);
                skipCount++;
                continue;
            }

            // Check if software already exists
            const existing = await db.query.softwares.findFirst({
                where: eq(softwares.name, entry.name)
            });

            if (existing) {
                skipCount++;
                continue;
            }

            // Determine platform (cross-platform for most free software)
            const platforms: string[] = ['windows', 'mac', 'linux', 'web'];

            // Insert software
            await db.insert(softwares).values({
                name: entry.name,
                description: entry.description,
                category_id: categoryId,
                platform: platforms,
                download_link: entry.sourceUrl || entry.url,
                image_url: null,
                created_by: adminUser!.id,
                status: 'approved',
                version: null,
                vendor: null,
                license: entry.license || 'Open Source',
                installation_instructions: null,
                documentation_link: entry.url,
                admin_notes: `Imported from awesome-free-software. License: ${entry.license || 'Unknown'}`,
            });

            successCount++;

            if (successCount % 20 === 0) {
                console.log(`  Processed ${successCount}/${entries.length}...`);
            }
        } catch (error) {
            console.error(`❌ Error inserting ${entry.name}:`, error);
            errorCount++;
        }
    }

    console.log(`\n✅ Seeding completed!`);
    console.log(`  ✓ Successfully inserted: ${successCount}`);
    console.log(`  ⊘ Skipped (duplicates): ${skipCount}`);
    console.log(`  ✗ Errors: ${errorCount}`);
}

seedFreeSoftwareData()
    .then(() => {
        console.log('\n🎉 Free software data seeding finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Seeding failed:', error);
        process.exit(1);
    });
