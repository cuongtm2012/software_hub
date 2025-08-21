import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface APIEntry {
    name: string;
    description: string;
    category: string;
    subcategory: string;
    url: string;
}

async function fetchReadme(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch README: ${response.statusText}`);
    }
    return await response.text();
}

function parseReadme(content: string): APIEntry[] {
    const entries: APIEntry[] = [];
    const lines = content.split('\n');

    let currentSubcategory = '';
    const mainCategory = 'Development (APIs)';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Parse subcategory (## or ### Header)
        if (line.startsWith('## ') || line.startsWith('### ')) {
            const header = line.replace(/^#+\s+/, '').trim();
            // Skip Table of Contents and meta headers
            const skipHeaders = ['Table of Contents', 'Contributors', 'Backers', 'Sponsors', 'License', 'Awesome APIs'];
            if (!skipHeaders.includes(header)) {
                currentSubcategory = header;
            }
            continue;
        }

        // Parse API entry (starts with + or -)
        // Format: + [Name](URL) - Description
        if ((line.startsWith('+ ') || line.startsWith('- ')) && currentSubcategory) {
            try {
                const match = line.match(/^[+-]\s+\[([^\]]+)\]\(([^)]+)\)\s*(?:[-–—]\s*)?(.*)$/);

                if (!match) continue;

                const name = match[1].trim();
                const url = match[2].trim();
                let description = match[3].trim();

                // Remove trailing period and clean description
                description = description.replace(/\.$/, '').trim();

                // Skip if name belongs to TOC
                if (name.includes('Back to top')) continue;

                entries.push({
                    name,
                    description: description || `API for ${currentSubcategory}`,
                    category: mainCategory,
                    subcategory: currentSubcategory,
                    url,
                });
            } catch (error) {
                console.error(`Error parsing line: ${line}`, error);
            }
        }
    }

    return entries;
}

async function main() {
    const repoUrl = 'https://raw.githubusercontent.com/TonnyL/Awesome_APIs/master/README.md';
    const outputFile = 'apis-data.json';

    console.log(`Fetching Awesome APIs...`);
    const content = await fetchReadme(repoUrl);

    console.log('Parsing API entries...');
    const entries = parseReadme(content);

    console.log(`Found ${entries.length} API entries`);

    // Save output
    const outputPath = join(__dirname, outputFile);
    writeFileSync(outputPath, JSON.stringify(entries, null, 2));
    console.log(`Saved to ${outputPath}`);

    // Print stats by subcategory
    const stats = entries.reduce((acc, entry) => {
        acc[entry.subcategory] = (acc[entry.subcategory] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log('\n=== Stats by Subcategory ===');
    Object.entries(stats).forEach(([sub, count]) => {
        console.log(`${sub}: ${count}`);
    });
}

main().catch(console.error);
