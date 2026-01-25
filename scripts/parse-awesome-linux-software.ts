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
}

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/luong-komorebi/Awesome-Linux-Software/master/README.md';

async function fetchReadme(): Promise<string> {
    console.log('Fetching README.md from GitHub...');
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

        // Parse category (### Applications, ### Command Line Utilities, etc.)
        if (line.startsWith('### ')) {
            currentCategory = line.replace('### ', '').trim();
            currentSubcategory = '';
            continue;
        }

        // Parse subcategory (#### Android, #### C++, etc.)
        if (line.startsWith('#### ')) {
            currentSubcategory = line.replace('#### ', '').trim();
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
    // Check for open source indicator
    const isOpenSource = line.includes('[![Open-Source Software][oss icon]]');

    // Check for free/paid indicator
    const isFree = !line.includes('![Non Free][money icon]') && !line.includes('![Nonfree][money icon]');

    // Extract source URL (GitHub link in open source badge)
    let sourceUrl: string | undefined;
    const sourceMatch = line.match(/\[\!\[Open-Source Software\]\[oss icon\]\]\((https?:\/\/[^\)]+)\)/);
    if (sourceMatch) {
        sourceUrl = sourceMatch[1];
    }

    // Remove badges to clean the line
    let cleanLine = line
        .replace(/\[\!\[Open-Source Software\]\[oss icon\]\]\([^\)]+\)\s*/g, '')
        .replace(/!\[Non Free\]\[money icon\]\s*/g, '')
        .replace(/!\[Nonfree\]\[money icon\]\s*/g, '')
        .replace(/!\[Nonfree\]\[freeware icon\]\s*/g, '')
        .replace(/^-\s*/, '');

    // Extract name and URL
    const nameMatch = cleanLine.match(/\[([^\]]+)\]\(([^\)]+)\)/);
    if (!nameMatch) {
        return null;
    }

    const name = nameMatch[1];
    const url = nameMatch[2];

    // Extract description (text after the link)
    const descMatch = cleanLine.match(/\]\([^\)]+\)\s*-?\s*(.+)/);
    const description = descMatch ? descMatch[1].trim() : '';

    return {
        name,
        description,
        category,
        subcategory,
        url,
        isOpenSource,
        isFree,
        sourceUrl,
    };
}

async function main() {
    try {
        console.log('Starting Awesome-Linux-Software parser...\n');

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
            // Filter out TOC links (URLs starting with #)
            if (entry.url.startsWith('#')) return false;

            // Filter out entries with empty or very short descriptions
            if (!entry.description || entry.description.length < 10) return false;

            // Filter out entries with empty category
            if (!entry.category) return false;

            // Filter out entries with generic names like "here", "Applications", etc.
            const genericNames = ['here', 'applications', 'audio', 'video', 'games', 'development'];
            if (genericNames.includes(entry.name.toLowerCase())) return false;

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

        // Count open source and free software
        const openSourceCount = entries.filter(e => e.isOpenSource).length;
        const freeCount = entries.filter(e => e.isFree).length;
        console.log(`\nOpen Source: ${openSourceCount} (${Math.round(openSourceCount / entries.length * 100)}%)`);
        console.log(`Free: ${freeCount} (${Math.round(freeCount / entries.length * 100)}%)`);

        // Save to JSON file
        const outputPath = path.join(__dirname, 'software-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));
        console.log(`\n✓ Data saved to ${outputPath}`);

        // Save sample for review
        const samplePath = path.join(__dirname, 'software-data-sample.json');
        fs.writeFileSync(samplePath, JSON.stringify(entries.slice(0, 20), null, 2));
        console.log(`✓ Sample saved to ${samplePath}`);

        console.log('\n✅ Parser completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
