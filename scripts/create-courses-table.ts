import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createCoursesTable() {
    console.log('=== Creating courses table ===\n');

    try {
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        topic TEXT NOT NULL,
        instructor TEXT,
        youtube_url TEXT NOT NULL,
        playlist_id TEXT,
        thumbnail_url TEXT,
        level TEXT,
        language TEXT DEFAULT 'vi',
        status TEXT DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log('✅ Table "courses" created successfully!');

        // Create indexes
        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_courses_topic ON courses(topic);
    `);

        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    `);

        console.log('✅ Indexes created successfully!');

    } catch (error) {
        console.error('❌ Error creating table:', error);
        throw error;
    }

    process.exit(0);
}

createCoursesTable().catch(console.error);
