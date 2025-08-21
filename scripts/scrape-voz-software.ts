import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface VOZSoftwareEntry {
    name: string;
    version?: string;
    description: string;
    downloadLinks: string[];
    platform: string[];
    category?: string;
    vendor?: string;
    license?: string;
    sourcePost: {
        url: string;
        author: string;
        date: string;
        postNumber: number;
    };
}

// Category classification keywords
const categoryKeywords: Record<string, string[]> = {
    'Office': ['word', 'excel', 'office', 'pdf', 'document', 'powerpoint', 'onenote'],
    'Graphics': ['photoshop', 'illustrator', 'design', 'photo', 'image', 'corel', 'gimp'],
    'Development': ['visual studio', 'ide', 'compiler', 'git', 'code', 'python', 'java'],
    'System': ['driver', 'system', 'windows', 'utility', 'cleaner', 'optimizer', 'registry'],
    'Multimedia': ['video', 'audio', 'media', 'player', 'editor', 'premiere', 'audacity'],
    'Security': ['antivirus', 'firewall', 'vpn', 'security', 'password', 'kaspersky', 'norton'],
    'Internet': ['browser', 'download', 'torrent', 'ftp', 'internet', 'chrome', 'firefox'],
    'Compression': ['winrar', 'zip', '7zip', 'compress', 'archive', 'extract'],
};

function classifyCategory(text: string): string {
    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return category;
        }
    }

    return 'General';
}

function extractVersion(text: string): string | undefined {
    const versionMatch = text.match(/v?(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/i);
    return versionMatch ? versionMatch[1] : undefined;
}

function detectPlatforms(text: string): string[] {
    const platforms: string[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('windows') || lowerText.includes('win')) platforms.push('Windows');
    if (lowerText.includes('mac') || lowerText.includes('macos')) platforms.push('Mac');
    if (lowerText.includes('linux')) platforms.push('Linux');
    if (lowerText.includes('android')) platforms.push('Android');
    if (lowerText.includes('ios') || lowerText.includes('iphone')) platforms.push('iOS');

    // Default to Windows if no platform detected
    if (platforms.length === 0) platforms.push('Windows');

    return platforms;
}

function extractDownloadLinks(html: string): string[] {
    const links: string[] = [];

    // Common file hosting patterns
    const patterns = [
        /https?:\/\/(?:www\.)?mediafire\.com\/[^\s"<>]+/gi,
        /https?:\/\/(?:drive|docs)\.google\.com\/[^\s"<>]+/gi,
        /https?:\/\/mega\.nz\/[^\s"<>]+/gi,
        /https?:\/\/(?:www\.)?dropbox\.com\/[^\s"<>]+/gi,
        /https?:\/\/(?:www\.)?4shared\.com\/[^\s"<>]+/gi,
        /https?:\/\/(?:www\.)?zippyshare\.com\/[^\s"<>]+/gi,
        /https?:\/\/(?:www\.)?uploaded\.net\/[^\s"<>]+/gi,
        /https?:\/\/(?:www\.)?rapidgator\.net\/[^\s"<>]+/gi,
    ];

    for (const pattern of patterns) {
        const matches = html.match(pattern);
        if (matches) {
            links.push(...matches);
        }
    }

    return [...new Set(links)]; // Remove duplicates
}

async function scrapeVOZThread(maxPages: number = 100): Promise<VOZSoftwareEntry[]> {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const baseUrl = 'https://voz.vn/t/tong-hop-software-can-thiet-cho-may-tinh.2974';
    const entries: VOZSoftwareEntry[] = [];

    try {
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const url = pageNum === 1 ? baseUrl : `${baseUrl}/page-${pageNum}`;
            console.log(`\nScraping page ${pageNum}: ${url}`);

            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Wait a bit for dynamic content
                await page.waitForTimeout(3000);

                // Wait for posts to load
                await page.waitForSelector('article.message', { timeout: 15000 });

                // Get all posts on the page
                const posts = await page.$$('article.message');
                console.log(`Found ${posts.length} posts on page ${pageNum}`);

                for (let i = 0; i < posts.length; i++) {
                    const post = posts[i];

                    try {
                        // Extract post content
                        const contentElement = await post.$('.message-body .bbWrapper');
                        if (!contentElement) continue;

                        const html = await contentElement.innerHTML();
                        const text = await contentElement.innerText();

                        // Skip if no download links
                        const downloadLinks = extractDownloadLinks(html);
                        if (downloadLinks.length === 0) continue;

                        // Extract software name (usually first bold text or heading)
                        const nameElement = await contentElement.$('b, strong, h1, h2, h3');
                        let name = nameElement ? await nameElement.innerText() : '';

                        // If no name found, try to extract from first line
                        if (!name) {
                            const firstLine = text.split('\n')[0];
                            name = firstLine.substring(0, 100).trim();
                        }

                        if (!name || name.length < 3) continue;

                        // Clean up name
                        name = name.replace(/^[-•*\s]+/, '').trim();

                        // Extract description (first few lines)
                        const lines = text.split('\n').filter(l => l.trim().length > 0);
                        const description = lines.slice(0, 3).join(' ').substring(0, 500);

                        if (description.length < 20) continue;

                        // Extract metadata
                        const version = extractVersion(text);
                        const platforms = detectPlatforms(text);
                        const category = classifyCategory(name + ' ' + description);

                        // Get post metadata
                        const authorElement = await post.$('.message-name');
                        const author = authorElement ? await authorElement.innerText() : 'Unknown';

                        const dateElement = await post.$('time');
                        const date = dateElement ? await dateElement.getAttribute('datetime') || '' : '';

                        const postNumberElement = await post.$('.message-number');
                        const postNumber = postNumberElement ? parseInt(await postNumberElement.innerText() || '0') : 0;

                        const postUrl = `${url}#post-${postNumber}`;

                        entries.push({
                            name,
                            version,
                            description,
                            downloadLinks,
                            platform: platforms,
                            category,
                            sourcePost: {
                                url: postUrl,
                                author,
                                date,
                                postNumber,
                            },
                        });

                        console.log(`  ✓ Extracted: ${name}`);
                    } catch (error) {
                        console.error(`  Error processing post ${i}:`, error);
                    }
                }

                // Check if there's a next page
                const nextButton = await page.$('a.pageNav-jump--next');
                if (!nextButton) {
                    console.log('\nReached last page');
                    break;
                }

                // Random delay to avoid detection
                await page.waitForTimeout(1000 + Math.random() * 2000);

            } catch (error) {
                console.error(`Error on page ${pageNum}:`, error);
                break;
            }
        }
    } finally {
        await browser.close();
    }

    return entries;
}

async function main() {
    const args = process.argv.slice(2);
    const maxPages = args.includes('--pages')
        ? parseInt(args[args.indexOf('--pages') + 1])
        : 100;
    const outputFile = args.includes('--output')
        ? args[args.indexOf('--output') + 1]
        : 'voz-software-data.json';

    console.log('=== VOZ Software Scraper ===');
    console.log(`Max pages: ${maxPages}`);
    console.log(`Output file: ${outputFile}\n`);

    const entries = await scrapeVOZThread(maxPages);

    console.log('\n=== Scraping Complete ===');
    console.log(`Total entries extracted: ${entries.length}`);
    console.log(`Categories: ${new Set(entries.map(e => e.category)).size}`);
    console.log(`Platforms: ${new Set(entries.flatMap(e => e.platform)).size}`);

    // Save to file
    const outputPath = join(__dirname, outputFile);
    writeFileSync(outputPath, JSON.stringify(entries, null, 2));
    console.log(`\nSaved to: ${outputPath}`);

    // Print sample
    console.log('\n=== Sample Entry ===');
    if (entries.length > 0) {
        console.log(JSON.stringify(entries[0], null, 2));
    }
}

main().catch(console.error);
