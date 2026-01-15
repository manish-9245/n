import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';

export async function GET() {
    try {
        const db = await getDb();
        const collections = await db
            .collection(COLLECTIONS.COLLECTIONS)
            .find({})
            .sort({ createdAt: 1 })
            .toArray();

        return NextResponse.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collections' },
            { status: 500 }
        );
    }
}
