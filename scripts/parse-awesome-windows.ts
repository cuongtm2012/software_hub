import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

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

async function fetchReadme(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch README: ${response.statusText}`);
    }
    return await response.text();
}

function parseReadme(content: string): SoftwareEntry[] {
    const entries: SoftwareEntry[] = [];
    const lines = content.split('\n');

    let currentSubcategory = '';
    const mainCategory = 'Windows Software';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip images and navigation
        if (line.includes('<img') || line.includes('table of contents')) {
            continue;
        }

        // Parse subcategory (### Header)
        if (line.startsWith('### ')) {
            const header = line.replace(/^###\s+/, '').trim();
            currentSubcategory = header;
            continue;
        }

        // Skip ## headers (Applications, Setup, etc.)
        if (line.startsWith('## ')) {
            continue;
        }

        // Parse software entry
        // Format: - [Name](URL) - Description ![Freeware][Freeware Icon]
        if (line.startsWith('- [') && currentSubcategory) {
            try {
                const match = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)\s*(?:[-–—]\s*)?(.*)$/);

                if (!match) continue;

                const name = match[1].trim();
                const url = match[2].trim();
                let description = match[3].trim();

                // Check for free/open-source badges
                const isFree = description.includes('![Freeware]') || description.includes('Freeware');
                const isOpenSource = description.includes('![Open-Source Software]') || description.includes('Open Source');

                // Remove badge markdown from description
                description = description
                    .replace(/!\[.*?\]\[.*?\]/g, '')
                    .replace(/!\[.*?\]\(.*?\)/g, '')
                    .trim();

                // Clean up description
                description = description.replace(/^[-–—]\s*/, '').trim();
                if (!description) {
                    description = `${name} for Windows`;
                }

                entries.push({
                    name,
                    description,
                    category: mainCategory,
                    subcategory: currentSubcategory,
                    url,
                    platform: ['Windows'],
                    isFree,
                    isOpenSource,
                });
            } catch (error) {
                console.error(`Error parsing line: ${line}`, error);
            }
        }
    }

    return entries;
}

async function main() {
    const repoUrl = 'https://raw.githubusercontent.com/thechampagne/awesome-windows/main/README.md';
    const outputFile = 'awesome-windows-data.json';

    console.log('Fetching Awesome Windows README...');
    const content = await fetchReadme(repoUrl);

    console.log('Parsing software entries...');
    const entries = parseReadme(content);

    console.log(`Found ${entries.length} software entries`);

    // Save output
    const outputPath = join(__dirname, outputFile);
    writeFileSync(outputPath, JSON.stringify(entries, null, 2));
    console.log(`Saved to ${outputPath}`);

    // Print stats
    const stats = {
        total: entries.length,
        bySubcategory: entries.reduce((acc, entry) => {
            acc[entry.subcategory] = (acc[entry.subcategory] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        free: entries.filter(e => e.isFree).length,
        openSource: entries.filter(e => e.isOpenSource).length,
    };

    console.log('\n=== Stats ===');
    console.log(`Total: ${stats.total}`);
    console.log(`Free: ${stats.free}`);
    console.log(`Open Source: ${stats.openSource}`);
    console.log('\nBy Subcategory:');
    Object.entries(stats.bySubcategory).forEach(([sub, count]) => {
        console.log(`  ${sub}: ${count}`);
    });
}

main().catch(console.error);
