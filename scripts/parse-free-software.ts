import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/johnjago/awesome-free-software/master/README.md';

async function fetchReadme(): Promise<string> {
    console.log('Fetching README.md from awesome-free-software...');
    const response = await fetch(GITHUB_RAW_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch README: ${response.statusText}`);
    }
    return await response.text();
}

function parseMarkdown(content: string): SoftwareEntry[] {
    const entries: SoftwareEntry[] = [];
    const lines = content.split('\n');

    let currentCategory = '';
    let currentSubcategory = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Parse category (## Software, ## Hardware, etc.)
        if (line.startsWith('## ')) {
            currentCategory = line.replace('## ', '').trim();
            currentSubcategory = '';
            continue;
        }

        // Parse subcategory (### Audio, ### Command Line Tools, etc.)
        if (line.startsWith('### ')) {
            currentSubcategory = line.replace('### ', '').trim();
            continue;
        }

        // Parse software entry (starts with - and contains a link)
        if (line.startsWith('- ') && line.includes('[') && line.includes(']')) {
            try {
                const entry = parseSoftwareEntry(line, currentCategory, currentSubcategory);
                if (entry) {
                    entries.push(entry);
                }
            } catch (error) {
                console.warn(`Failed to parse line: ${line}`, error);
            }
        }
    }

    return entries;
}

function parseSoftwareEntry(line: string, category: string, subcategory: string): SoftwareEntry | null {
    // Extract name and URL
    const nameMatch = line.match(/\[([^\]]+)\]\(([^\)]+)\)/);
    if (!nameMatch) {
        return null;
    }

    const name = nameMatch[1];
    const url = nameMatch[2];

    // Extract description (text between first link and license link)
    const afterFirstLink = line.substring(line.indexOf(')') + 1);
    const descMatch = afterFirstLink.match(/^\s*-\s*(.+?)\s*\(\[/);
    const description = descMatch ? descMatch[1].trim() : '';

    // Extract license
    const licenseMatch = line.match(/\(\[([^\]]+)\]\([^\)]+\)\)$/);
    const license = licenseMatch ? licenseMatch[1] : '';

    // All software in this list is free and open source
    const isOpenSource = true;
    const isFree = true;

    return {
        name,
        description: description || 'No description available',
        category,
        subcategory,
        url,
        isOpenSource,
        isFree,
        sourceUrl: url,
        license,
    };
}

async function main() {
    try {
        console.log('Starting awesome-free-software parser...\n');

        // Fetch README
        const content = await fetchReadme();
        console.log('✓ README.md fetched successfully\n');

        // Parse content
        console.log('Parsing software entries...');
        const allEntries = parseMarkdown(content);
        console.log(`✓ Parsed ${allEntries.length} total entries\n`);

        // Filter valid software entries
        console.log('Filtering valid software entries...');
        const entries = allEntries.filter(entry => {
            // Filter out entries with empty category (non-software sections)
            if (!entry.category || entry.category === 'Hardware' || entry.category === 'Resources') return false;

            // Filter out entries with empty or very short descriptions
            if (!entry.description || entry.description.length < 10) return false;

            // Filter out TOC links
            if (entry.url.startsWith('#')) return false;

            return true;
        });
        console.log(`✓ Filtered to ${entries.length} valid software entries\n`);

        // Group by category for stats
        const categoryCounts: Record<string, number> = {};
        entries.forEach(entry => {
            const key = entry.subcategory ? `${entry.category} > ${entry.subcategory}` : entry.category;
            categoryCounts[key] = (categoryCounts[key] || 0) + 1;
        });

        console.log('Category breakdown (top 20):');
        Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .forEach(([cat, count]) => {
                console.log(`  ${cat}: ${count}`);
            });

        // Count licenses
        const licenseCounts: Record<string, number> = {};
        entries.forEach(entry => {
            if (entry.license) {
                licenseCounts[entry.license] = (licenseCounts[entry.license] || 0) + 1;
            }
        });

        console.log('\nTop licenses:');
        Object.entries(licenseCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([license, count]) => {
                console.log(`  ${license}: ${count}`);
            });

        console.log(`\nOpen Source: ${entries.filter(e => e.isOpenSource).length} (100%)`);
        console.log(`Free: ${entries.filter(e => e.isFree).length} (100%)`);

        // Save to JSON file
        const outputPath = path.join(__dirname, 'free-software-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));
        console.log(`\n✓ Data saved to ${outputPath}`);

        // Save sample for review
        const samplePath = path.join(__dirname, 'free-software-data-sample.json');
        fs.writeFileSync(samplePath, JSON.stringify(entries.slice(0, 20), null, 2));
        console.log(`✓ Sample saved to ${samplePath}`);

        console.log('\n✅ Parser completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
