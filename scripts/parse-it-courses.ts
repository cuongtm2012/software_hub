import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Course {
    title: string;
    instructor: string;
    youtubeUrl: string;
    playlistId: string;
    thumbnailUrl: string;
    level: string;
}

interface TopicData {
    topic: string;
    courses: Course[];
}

async function parseITCourses() {
    console.log('=== Parsing IT Courses from GitHub ===\n');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Navigate to GitHub README
        const url = 'https://github.com/tmsanghoclaptrinh/tai-lieu-lap-trinh-tieng-viet-mien-phi';
        console.log(`Fetching: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle' });

        // Wait for README content
        await page.waitForSelector('article.markdown-body', { timeout: 10000 });

        // Extract all topics and courses
        const topicsData: TopicData[] = await page.evaluate(() => {
            const article = document.querySelector('article.markdown-body');
            if (!article) return [];

            const results: TopicData[] = [];
            let currentTopic = '';
            let currentCourses: Course[] = [];

            // Get all h2 headers (topics) and following lists
            const elements = article.querySelectorAll('h2, ul');

            elements.forEach((el) => {
                if (el.tagName === 'H2') {
                    // Save previous topic if exists
                    if (currentTopic && currentCourses.length > 0) {
                        results.push({
                            topic: currentTopic,
                            courses: currentCourses
                        });
                    }

                    // Start new topic
                    currentTopic = el.textContent?.trim() || '';
                    currentCourses = [];
                } else if (el.tagName === 'UL' && currentTopic) {
                    // Parse courses from list items
                    const items = el.querySelectorAll('li');
                    items.forEach((li) => {
                        const link = li.querySelector('a');
                        if (!link) return;

                        const fullText = li.textContent?.trim() || '';
                        const linkText = link.textContent?.trim() || '';
                        const youtubeUrl = link.getAttribute('href') || '';

                        // Only process YouTube playlist links
                        if (!youtubeUrl.includes('youtube.com/playlist')) return;

                        // Extract instructor (text after " - ")
                        const parts = fullText.split(' - ');
                        const instructor = parts.length > 1 ? parts[parts.length - 1].trim() : '';

                        // Extract playlist ID from URL
                        const playlistMatch = youtubeUrl.match(/list=([^&]+)/);
                        const playlistId = playlistMatch ? playlistMatch[1] : '';

                        // Generate thumbnail URL
                        const thumbnailUrl = playlistId
                            ? `https://i.ytimg.com/vi/${playlistId}/hqdefault.jpg`
                            : '';

                        // Determine level based on keywords
                        let level = 'beginner';
                        const lowerTitle = linkText.toLowerCase();
                        if (lowerTitle.includes('nâng cao') || lowerTitle.includes('advanced')) {
                            level = 'advanced';
                        } else if (lowerTitle.includes('trung cấp') || lowerTitle.includes('intermediate')) {
                            level = 'intermediate';
                        }

                        currentCourses.push({
                            title: linkText,
                            instructor,
                            youtubeUrl,
                            playlistId,
                            thumbnailUrl,
                            level
                        });
                    });
                }
            });

            // Add last topic
            if (currentTopic && currentCourses.length > 0) {
                results.push({
                    topic: currentTopic,
                    courses: currentCourses
                });
            }

            return results;
        });

        await browser.close();

        // Calculate stats
        const totalTopics = topicsData.length;
        const totalCourses = topicsData.reduce((sum, topic) => sum + topic.courses.length, 0);

        console.log(`\n=== Parsing Complete ===`);
        console.log(`Topics found: ${totalTopics}`);
        console.log(`Total courses: ${totalCourses}`);

        // Show top 5 topics
        console.log(`\nTop 5 topics by course count:`);
        topicsData
            .sort((a, b) => b.courses.length - a.courses.length)
            .slice(0, 5)
            .forEach((topic, index) => {
                console.log(`  ${index + 1}. ${topic.topic}: ${topic.courses.length} courses`);
            });

        // Save to JSON file
        const outputPath = join(__dirname, 'courses-data.json');
        writeFileSync(outputPath, JSON.stringify(topicsData, null, 2));

        console.log(`\n✅ Data saved to: ${outputPath}`);

    } catch (error) {
        console.error('Error parsing courses:', error);
        await browser.close();
        process.exit(1);
    }
}

parseITCourses().catch(console.error);
