import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await getDb();
        const problem = await db
            .collection(COLLECTIONS.PROBLEMS)
            .findOne({ _id: new ObjectId(id) });

        if (!problem) {
            return NextResponse.json(
                { error: 'Problem not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(problem);
    } catch (error) {
        console.error('Error fetching problem:', error);
        return NextResponse.json(
            { error: 'Failed to fetch problem' },
            { status: 500 }
        );
    }
}
