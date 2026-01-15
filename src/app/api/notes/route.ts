import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS, Note } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const problemId = searchParams.get('problemId');

        if (!problemId) {
            return NextResponse.json(
                { error: 'problemId is required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const note = await db
            .collection(COLLECTIONS.NOTES)
            .findOne({ problemId: new ObjectId(problemId) });

        return NextResponse.json(note || null);
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json(
            { error: 'Failed to fetch note' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { problemId, content } = body;

        if (!problemId || content === undefined) {
            return NextResponse.json(
                { error: 'problemId and content are required' },
                { status: 400 }
            );
        }

        const db = await getDb();

        // Upsert: update if exists, create if doesn't
        const result = await db.collection(COLLECTIONS.NOTES).findOneAndUpdate(
            { problemId: new ObjectId(problemId) },
            {
                $set: {
                    content,
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    problemId: new ObjectId(problemId),
                    createdAt: new Date(),
                },
            },
            { upsert: true, returnDocument: 'after' }
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error saving note:', error);
        return NextResponse.json(
            { error: 'Failed to save note' },
            { status: 500 }
        );
    }
}
