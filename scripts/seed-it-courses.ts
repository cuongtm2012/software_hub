import { db } from '../server/db';
import { courses } from '../shared/schema';
import { readFileSync } from 'fs';
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

async function seedITCourses() {
    const dryRun = process.argv.includes('--dry-run');

    console.log('=== IT Courses Seed Script ===');
    console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '⚠️  LIVE IMPORT'}\n`);

    // Read parsed data
    const dataPath = join(__dirname, 'courses-data.json');
    const topicsData: TopicData[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

    console.log(`Loaded ${topicsData.length} topics from courses-data.json`);

    let totalImported = 0;
    let totalSkipped = 0;

    try {
        for (const topicData of topicsData) {
            console.log(`\n📚 Processing topic: ${topicData.topic} (${topicData.courses.length} courses)`);

            for (const course of topicData.courses) {
                // Check if course already exists (by youtube_url)
                const existing = await db.query.courses.findFirst({
                    where: (courses, { eq }) => eq(courses.youtube_url, course.youtubeUrl),
                });

                if (existing) {
                    console.log(`  ⏭️  Skipped: ${course.title} (already exists)`);
                    totalSkipped++;
                    continue;
                }

                if (!dryRun) {
                    // Insert course
                    await db.insert(courses).values({
                        title: course.title,
                        description: `Khóa học ${topicData.topic} bằng tiếng Việt`,
                        topic: topicData.topic,
                        instructor: course.instructor || 'Unknown',
                        youtube_url: course.youtubeUrl,
                        playlist_id: course.playlistId,
                        thumbnail_url: course.thumbnailUrl,
                        level: course.level,
                        language: 'vi',
                        status: 'approved',
                    });

                    console.log(`  ✅ Imported: ${course.title}`);
                } else {
                    console.log(`  [DRY RUN] Would import: ${course.title}`);
                }

                totalImported++;
            }
        }

        console.log('\n\n=== Import Summary ===');
        console.log(`Topics processed: ${topicsData.length}`);
        console.log(`Courses imported: ${totalImported}`);
        console.log(`Courses skipped: ${totalSkipped}`);

        if (dryRun) {
            console.log('\n✅ Dry run completed successfully!');
            console.log('Run without --dry-run flag to import data.');
        } else {
            console.log('\n✅ Import completed successfully!');
        }

    } catch (error) {
        console.error('\n❌ Import failed:', error);
        throw error;
    }

    process.exit(0);
}

seedITCourses().catch(console.error);
