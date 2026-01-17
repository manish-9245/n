import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';

export async function GET() {
    try {
        const db = await getDb();

        // Get all unique problemIds that have at least one solution
        const pipeline = [
            {
                $group: {
                    _id: '$problemId'
                }
            }
        ];

        const results = await db
            .collection(COLLECTIONS.SOLUTIONS)
            .aggregate(pipeline)
            .toArray();

        // Convert ObjectIds to strings
        const solvedProblemIds = results.map(item => item._id.toString());

        return NextResponse.json({ solvedProblemIds });
    } catch (error) {
        console.error('Error fetching progress:', error);
        return NextResponse.json(
            { error: 'Failed to fetch progress' },
            { status: 500 }
        );
    }
}
