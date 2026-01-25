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
    sourceUrl?: string;
    license?: string;
    language?: string;
    isOpenSource: boolean;
    isFree: boolean;
    platform: string[];
}

async function fetchReadme(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch README: ${response.statusText}`);
    }
    return await response.text();
}

function parseReadme(content: string, mainCategory: string): SoftwareEntry[] {
    const entries: SoftwareEntry[] = [];
    const lines = content.split('\n');

    let currentSubcategory = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Parse subcategory (## or ### Header)
        if (line.startsWith('## ') || line.startsWith('### ')) {
            currentSubcategory = line.replace(/^#+\s+/, '').trim();
            // Remove markdown badges and links
            currentSubcategory = currentSubcategory.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '').trim();
            continue;
        }

        // Parse software entry (starts with -)
        if (line.startsWith('- ')) {
            try {
                // Extract name and URL - handle both [name](url) and **[name](url)** formats
                const nameMatch = line.match(/\*?\*?\[([^\]]+)\]\(([^)]+)\)\*?\*?/);

                if (!nameMatch) continue;

                const name = nameMatch[1];
                const url = nameMatch[2];

                // Extract description (text after link)
                let description = line.split(/\)\s*[-–—]\s*/)[1] || '';
                if (!description) {
                    description = line.split(/\*\*\s*[-–—]\s*/)[1] || '';
                }
                if (!description) {
                    description = line.split(/\)\s+/)[1] || '';
                }

                // Remove trailing period
                description = description.replace(/\.$/, '').trim();

                // Skip if description is too short or empty
                if (!description || description.length < 10) continue;

                // Skip TOC links
                if (name.includes('back to top') || description.includes('back to top')) continue;

                // Determine platform
                const platforms: string[] = [];
                const lowerDesc = description.toLowerCase();

                if (lowerDesc.includes('r package') || url.includes('cran.r-project')) {
                    platforms.push('Linux', 'Mac', 'Windows');
                } else if (lowerDesc.includes('python') || url.includes('pypi.org')) {
                    platforms.push('Linux', 'Mac', 'Windows');
                } else if (lowerDesc.includes('web') || lowerDesc.includes('online')) {
                    platforms.push('Web');
                } else {
                    platforms.push('Linux', 'Mac', 'Windows');
                }

                entries.push({
                    name,
                    description,
                    category: mainCategory,
                    subcategory: currentSubcategory || 'General',
                    url,
                    sourceUrl: url.includes('github.com') ? url : undefined,
                    license: 'Open Source',
                    language: url.includes('cran.r-project') ? 'R' : 'Unknown',
                    isOpenSource: true,
                    isFree: true,
                    platform: platforms,
                });
            } catch (error) {
                console.error(`Error parsing line: ${line}`, error);
            }
        }
    }

    return entries;
}

async function main() {
    const repos = [
        {
            url: 'https://raw.githubusercontent.com/SNStatComp/awesome-official-statistics-software/master/README.md',
            category: 'Official Statistics Software',
            outputFile: 'statistics-data.json'
        },
        {
            url: 'https://raw.githubusercontent.com/uraimo/awesome-software-patreons/master/README.md',
            category: 'Software Patreons',
            outputFile: 'patreons-data.json'
        }
    ];

    const allEntries: SoftwareEntry[] = [];

    for (const repo of repos) {
        console.log(`\nFetching ${repo.category}...`);
        const content = await fetchReadme(repo.url);

        console.log('Parsing software entries...');
        const entries = parseReadme(content, repo.category);

        console.log(`Found ${entries.length} software entries`);

        // Save individual file
        const outputPath = join(__dirname, repo.outputFile);
        writeFileSync(outputPath, JSON.stringify(entries, null, 2));
        console.log(`Saved to ${outputPath}`);

        allEntries.push(...entries);
    }

    // Save combined file
    const combinedPath = join(__dirname, 'combined-awesome-data.json');
    writeFileSync(combinedPath, JSON.stringify(allEntries, null, 2));
    console.log(`\nSaved combined data to ${combinedPath}`);

    // Print stats
    console.log('\n=== Total Stats ===');
    console.log(`Total entries: ${allEntries.length}`);
    console.log(`Categories: ${new Set(allEntries.map(e => e.category)).size}`);
    console.log(`Subcategories: ${new Set(allEntries.map(e => e.subcategory)).size}`);
}

main().catch(console.error);
