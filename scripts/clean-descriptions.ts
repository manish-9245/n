
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error('Please add MONGODB_URI to .env.local');
const DB_NAME = process.env.MONGODB_DB || 'neetcode_tracker';

async function cleanDescriptions() {
    console.log('🧹 Starting description cleanup...');

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to DB');

    const db = client.db(DB_NAME);
    const problems = await db.collection('problems').find({}).toArray();

    let updated = 0;
    let skipped = 0;

    for (const problem of problems) {
        if (!problem.description) {
            skipped++;
            continue;
        }

        const desc = problem.description;

        // Extract content between <!-- description:start --> and <!-- description:end -->
        const startMarker = '<!-- description:start -->';
        const endMarker = '<!-- description:end -->';

        const startIndex = desc.indexOf(startMarker);
        const endIndex = desc.indexOf(endMarker);

        if (startIndex !== -1 && endIndex !== -1) {
            // Found the markers, slice the content
            let cleanDesc = desc.substring(startIndex + startMarker.length, endIndex).trim();

            // Should we update?
            // Yes.
            await db.collection('problems').updateOne(
                { _id: problem._id },
                { $set: { description: cleanDesc } }
            );
            process.stdout.write('.');
            updated++;
        } else {
            console.log(`\n⚠️  Markers not found for "${problem.title}"`);
            // If markers not found, maybe it's already clean or weird format? 
            // Most likely it's a Doocs file that doesn't split it this way?
            // But we saw the sample had it.
            // If it's a placeholder "Add problem description here", we skip.
            skipped++;
        }
    }

    console.log(`\n\n✨ Cleanup Complete! Updated: ${updated}, Skipped: ${skipped}`);
    await client.close();
}

cleanDescriptions();
