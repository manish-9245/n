
import dotenv from 'dotenv';
import path from 'path';

// 1. Load env vars first
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

async function backfillSolutions() {
    console.log('Starting backfill process...');

    // 2. Dynamic imports to ensure env vars are loaded before modules are evaluated
    const { getDb } = await import('../src/lib/mongodb');
    const { COLLECTIONS } = await import('../src/lib/types');
    const { estimateComplexity } = await import('../src/lib/gemini');

    console.log('Connecting to database...');
    const db = await getDb();
    console.log('Connected to MongoDB.');

    const solutionsCollection = db.collection(COLLECTIONS.SOLUTIONS);

    // Find documents missing time or space complexity
    const query = {
        $or: [
            { timeComplexity: { $exists: false } },
            { timeComplexity: null },
            { timeComplexity: "" },
            { spaceComplexity: { $exists: false } },
            { spaceComplexity: null },
            { spaceComplexity: "" }
        ]
    };

    const count = await solutionsCollection.countDocuments(query);
    console.log(`Found ${count} solutions with missing complexity data.`);

    if (count === 0) {
        console.log('No solutions to update.');
        process.exit(0);
    }

    const solutions = await solutionsCollection.find(query).toArray();

    let successCount = 0;
    let failCount = 0;

    for (const sol of solutions) {
        console.log(`Processing solution ${sol._id} (Problem: ${sol.problemId}, Lang: ${sol.language})...`);

        try {
            // Rate limiting: wait 1.5 seconds between requests
            await new Promise(resolve => setTimeout(resolve, 1500));

            const estimates = await estimateComplexity(sol.code, sol.language);

            if (estimates) {
                const updateFields: any = {};

                if (!sol.timeComplexity && estimates.timeComplexity) {
                    updateFields.timeComplexity = estimates.timeComplexity;
                }
                if (!sol.spaceComplexity && estimates.spaceComplexity) {
                    updateFields.spaceComplexity = estimates.spaceComplexity;
                }

                if (Object.keys(updateFields).length > 0) {
                    await solutionsCollection.updateOne(
                        { _id: sol._id },
                        {
                            $set: {
                                ...updateFields,
                                updatedAt: new Date()
                            }
                        }
                    );
                    console.log(`✅ Updated ${sol._id}:`, updateFields);
                    successCount++;
                } else {
                    console.log(`ℹ️ No updates needed for ${sol._id}.`);
                }
            } else {
                console.log(`⚠️ Failed to estimate for ${sol._id}.`);
                failCount++;
            }
        } catch (error) {
            console.error(`❌ Error processing ${sol._id}:`, error);
            failCount++;
        }
    }

    console.log('--------------------------------------------------');
    console.log('Backfill complete.');
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed/Skipped: ${failCount}`);
    process.exit(0);
}

backfillSolutions().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
