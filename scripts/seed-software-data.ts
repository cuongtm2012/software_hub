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
}

async function seedSoftwareData() {
    console.log('🌱 Starting software data seeding...\n');

    // Read parsed data
    const dataPath = path.join(__dirname, 'software-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const entries: SoftwareEntry[] = JSON.parse(rawData);

    console.log(`📦 Loaded ${entries.length} software entries\n`);

    // Get or create admin user for created_by
    let adminUser = await db.query.users.findFirst({
        where: eq(users.role, 'admin')
    });

    if (!adminUser) {
        console.log('Creating admin user...');
        const [newAdmin] = await db.insert(users).values({
            name: 'System Admin',
            email: 'admin@softwarehub.com',
            password: 'hashed_password', // This should be properly hashed
            role: 'admin',
        }).returning();
        adminUser = newAdmin;
        console.log('✓ Admin user created\n');
    }

    // Group entries by category
    const categoryMap = new Map<string, number>();
    const subcategoryMap = new Map<string, number>();

    console.log('📁 Creating categories...');

    // Get unique categories and subcategories
    const uniqueCategories = new Set<string>();
    const uniqueSubcategories = new Map<string, string>(); // subcategory -> parent category

    entries.forEach(entry => {
        if (entry.category) {
            uniqueCategories.add(entry.category);
            if (entry.subcategory) {
                uniqueSubcategories.set(entry.subcategory, entry.category);
            }
        }
    });

    // Insert parent categories first
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

    // Insert subcategories
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

    console.log(`✓ Created ${categoryMap.size} parent categories`);
    console.log(`✓ Created ${subcategoryMap.size} subcategories\n`);

    // Insert software entries
    console.log('💾 Inserting software entries...');
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const entry of entries) {
        try {
            // Determine category ID (prefer subcategory if available)
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

            // Determine platform based on category/description
            const platforms: string[] = ['linux']; // Default to Linux since it's from Awesome-Linux-Software

            // Insert software
            await db.insert(softwares).values({
                name: entry.name,
                description: entry.description || 'No description available',
                category_id: categoryId,
                platform: platforms,
                download_link: entry.sourceUrl || entry.url,
                image_url: null, // We don't have images from the source
                created_by: adminUser!.id,
                status: 'approved', // Auto-approve since it's from curated list
                version: null,
                vendor: null,
                license: entry.isOpenSource ? 'Open Source' : (entry.isFree ? 'Freeware' : 'Commercial'),
                installation_instructions: null,
                documentation_link: entry.url,
                admin_notes: `Imported from Awesome-Linux-Software. Open Source: ${entry.isOpenSource}, Free: ${entry.isFree}`,
            });

            successCount++;

            // Progress indicator
            if (successCount % 100 === 0) {
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

seedSoftwareData()
    .then(() => {
        console.log('\n🎉 Software data seeding finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Seeding failed:', error);
        process.exit(1);
    });
