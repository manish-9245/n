import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const db = await getDb();
        const collection = await db
            .collection(COLLECTIONS.COLLECTIONS)
            .findOne({ slug });

        if (!collection) {
            return NextResponse.json(
                { error: 'Collection not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(collection);
    } catch (error) {
        console.error('Error fetching collection:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collection' },
            { status: 500 }
        );
    }
}
