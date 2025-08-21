import { db } from '../server/db';
import { softwares } from '../shared/schema';
import { inArray } from 'drizzle-orm';

async function deleteDiscussionForums() {
    const namesToDelete = [
        'Stack Overflow',
        'Super User',
        '#Windows',
        '#microsoft',
        '/r/windows',
        '/r/windowsapps',
        '/r/microsoft',
        '/r/sysadmin',
        '/r/microsoftsoftwareswap'
    ];

    console.log('Finding discussion forum entries to delete...');
    const toDelete = await db.query.softwares.findMany({
        where: (softwares, { inArray }) => inArray(softwares.name, namesToDelete),
    });

    console.log(`\nFound ${toDelete.length} entries:`);
    toDelete.forEach(s => console.log(`  - ${s.name} (ID: ${s.id})`));

    if (toDelete.length === 0) {
        console.log('\n✅ No discussion forum entries found to delete');
        process.exit(0);
    }

    console.log('\nDeleting...');
    await db.delete(softwares)
        .where(inArray(softwares.name, namesToDelete));

    console.log(`\n✅ Successfully deleted ${toDelete.length} discussion forum entries`);

    process.exit(0);
}

deleteDiscussionForums().catch(console.error);
