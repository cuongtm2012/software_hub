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
    isOpenSource?: boolean;
    isRecommended?: boolean;
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

    let currentCategory = '';
    let currentSubcategory = '';
    const mainCategory = 'Free Applications';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip header links and navigation
        if (line.includes('Windows Only') || line.includes('macOS Only') || line.includes('Mobile version')) {
            continue;
        }

        // Parse category (## Header)
        if (line.startsWith('## ')) {
            const header = line.replace(/^##\s+/, '').trim();
            // Skip meta headers
            const skipHeaders = ['Table of Contents', 'Contributing', 'License', 'Awesome Free Apps'];
            if (!skipHeaders.includes(header)) {
                currentCategory = header;
                currentSubcategory = '';
            }
            continue;
        }

        // Parse subcategory (### Header)
        if (line.startsWith('### ')) {
            const header = line.replace(/^###\s+/, '').trim();
            currentSubcategory = header;
            continue;
        }

        // Parse software entry
        // Format: - [Name](URL) - Description `platform` `tags`
        if (line.startsWith('- [') && currentCategory) {
            try {
                const match = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)\s*(?:[-–—]\s*)?(.*)$/);

                if (!match) continue;

                const name = match[1].trim();
                const url = match[2].trim();
                let description = match[3].trim();

                // Extract platform and tags from backticks
                const platforms: string[] = [];
                let isOpenSource = false;
                let isRecommended = false;

                // Extract all backtick content
                const backtickMatches = description.match(/`([^`]+)`/g);
                if (backtickMatches) {
                    backtickMatches.forEach(tag => {
                        const cleanTag = tag.replace(/`/g, '').toLowerCase();

                        if (cleanTag.includes('windows')) platforms.push('Windows');
                        if (cleanTag.includes('macos') || cleanTag.includes('mac')) platforms.push('Mac');
                        if (cleanTag.includes('linux')) platforms.push('Linux');
                        if (cleanTag.includes('android')) platforms.push('Android');
                        if (cleanTag.includes('ios')) platforms.push('iOS');
                        if (cleanTag.includes('web')) platforms.push('Web');

                        if (cleanTag.includes('open-source') || cleanTag.includes('opensource')) {
                            isOpenSource = true;
                        }
                        if (cleanTag.includes('recommended')) {
                            isRecommended = true;
                        }
                    });

                    // Remove backtick tags from description
                    description = description.replace(/`[^`]+`/g, '').trim();
                }

                // Default to Windows if no platform specified
                if (platforms.length === 0) {
                    platforms.push('Windows');
                }

                // Clean up description
                description = description.replace(/^[-–—]\s*/, '').trim();
                if (!description) {
                    description = `${name} application`;
                }

                entries.push({
                    name,
                    description,
                    category: mainCategory,
                    subcategory: currentSubcategory || currentCategory,
                    url,
                    platform: [...new Set(platforms)],
                    isOpenSource,
                    isRecommended,
                });
            } catch (error) {
                console.error(`Error parsing line: ${line}`, error);
            }
        }
    }

    return entries;
}

async function main() {
    const repoUrl = 'https://raw.githubusercontent.com/Axorax/awesome-free-apps/main/README.md';
    const outputFile = 'free-apps-data.json';

    console.log('Fetching Awesome Free Apps README...');
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
        byPlatform: entries.reduce((acc, entry) => {
            entry.platform.forEach(p => {
                acc[p] = (acc[p] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>),
        openSource: entries.filter(e => e.isOpenSource).length,
        recommended: entries.filter(e => e.isRecommended).length,
    };

    console.log('\n=== Stats ===');
    console.log(`Total: ${stats.total}`);
    console.log(`Open Source: ${stats.openSource}`);
    console.log(`Recommended: ${stats.recommended}`);
    console.log('\nBy Platform:');
    Object.entries(stats.byPlatform).forEach(([platform, count]) => {
        console.log(`  ${platform}: ${count}`);
    });
    console.log('\nBy Subcategory:');
    Object.entries(stats.bySubcategory).forEach(([sub, count]) => {
        console.log(`  ${sub}: ${count}`);
    });
}

main().catch(console.error);
