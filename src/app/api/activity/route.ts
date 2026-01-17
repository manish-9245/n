import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';

export async function GET() {
    try {
        const db = await getDb();

        // Get date 365 days ago
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);
        oneYearAgo.setHours(0, 0, 0, 0);

        // Aggregate solutions by date
        const pipeline = [
            {
                $match: {
                    createdAt: { $gte: oneYearAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt',
                            timezone: 'Asia/Kolkata' // IST timezone
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ];

        const results = await db
            .collection(COLLECTIONS.SOLUTIONS)
            .aggregate(pipeline)
            .toArray();

        // Convert to a simple object: { "2026-01-17": 3, ... }
        const activityMap: Record<string, number> = {};
        for (const item of results) {
            activityMap[item._id] = item.count;
        }

        return NextResponse.json(activityMap);
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activity data' },
            { status: 500 }
        );
    }
}
