import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const db = await getDb();

        // First get the collection
        const collection = await db
            .collection(COLLECTIONS.COLLECTIONS)
            .findOne({ slug });

        if (!collection) {
            return NextResponse.json(
                { error: 'Collection not found' },
                { status: 404 }
            );
        }

        // Get all problems for this collection
        const problems = await db
            .collection(COLLECTIONS.PROBLEMS)
            .find({ collectionId: collection._id })
            .sort({ order: 1 })
            .toArray();

        return NextResponse.json(problems);
    } catch (error) {
        console.error('Error fetching problems:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problems' },
            { status: 500 }
        );
    }
}
