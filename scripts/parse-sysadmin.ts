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

async function fetchReadme(): Promise<string> {
    const response = await fetch('https://raw.githubusercontent.com/awesome-foss/awesome-sysadmin/master/README.md');
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

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Parse category (### Header)
        if (line.startsWith('### ')) {
            currentSubcategory = line.replace('### ', '').trim();
            currentCategory = 'System Administration';
            continue;
        }

        // Parse software entry (starts with -)
        if (line.startsWith('- [')) {
            try {
                // Extract name and URL
                const nameMatch = line.match(/- \[([^\]]+)\]/);
                const urlMatch = line.match(/\]\(([^)]+)\)/);

                if (!nameMatch || !urlMatch) continue;

                const name = nameMatch[1];
                const url = urlMatch[1];

                // Extract description (text after first link, before source code link)
                let description = line.split(') - ')[1] || '';
                if (description.includes('([Source Code]')) {
                    description = description.split('([Source Code]')[0].trim();
                }

                // Remove trailing period
                description = description.replace(/\.$/, '').trim();

                // Extract source code URL
                const sourceMatch = line.match(/\[Source Code\]\(([^)]+)\)/);
                const sourceUrl = sourceMatch ? sourceMatch[1] : undefined;

                // Extract license and language
                const licenseMatch = line.match(/`([^`]+)`\s+`([^`]+)`/);
                let license = '';
                let language = '';

                if (licenseMatch) {
                    license = licenseMatch[1];
                    language = licenseMatch[2];
                }

                // Determine platform based on language/description
                const platforms: string[] = [];
                const lowerDesc = description.toLowerCase();
                const lowerLang = language.toLowerCase();

                if (lowerDesc.includes('windows') || lowerDesc.includes('macos') || lowerDesc.includes('linux')) {
                    if (lowerDesc.includes('windows')) platforms.push('Windows');
                    if (lowerDesc.includes('macos')) platforms.push('Mac');
                    if (lowerDesc.includes('linux')) platforms.push('Linux');
                } else if (lowerLang.includes('docker')) {
                    platforms.push('Linux', 'Mac', 'Windows');
                } else if (['java', 'python', 'go', 'rust', 'c', 'c++'].some(lang => lowerLang.includes(lang))) {
                    platforms.push('Linux', 'Mac', 'Windows');
                } else if (lowerDesc.includes('web') || lowerLang.includes('javascript') || lowerLang.includes('php')) {
                    platforms.push('Web');
                } else {
                    platforms.push('Linux');
                }

                // Skip entries without proper description
                if (!description || description.length < 10) continue;

                // Skip TOC links
                if (name.includes('back to top')) continue;

                entries.push({
                    name,
                    description,
                    category: currentCategory,
                    subcategory: currentSubcategory,
                    url,
                    sourceUrl,
                    license,
                    language,
                    isOpenSource: true, // All entries in awesome-sysadmin are open source
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
    console.log('Fetching awesome-sysadmin README...');
    const content = await fetchReadme();

    console.log('Parsing software entries...');
    const entries = parseReadme(content);

    console.log(`Found ${entries.length} software entries`);

    // Save to JSON file
    const outputPath = join(__dirname, 'sysadmin-data.json');
    writeFileSync(outputPath, JSON.stringify(entries, null, 2));
    console.log(`Saved to ${outputPath}`);

    // Save sample (first 10 entries)
    const samplePath = join(__dirname, 'sysadmin-data-sample.json');
    writeFileSync(samplePath, JSON.stringify(entries.slice(0, 10), null, 2));
    console.log(`Sample saved to ${samplePath}`);

    // Print stats
    const stats = {
        total: entries.length,
        categories: new Set(entries.map(e => e.subcategory)).size,
        openSource: entries.filter(e => e.isOpenSource).length,
        free: entries.filter(e => e.isFree).length,
    };

    console.log('\nStats:', stats);
}

main().catch(console.error);
