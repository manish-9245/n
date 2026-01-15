import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, language, code, timeComplexity, spaceComplexity, explanation } = body;

        const db = await getDb();
        const result = await db.collection(COLLECTIONS.SOLUTIONS).updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    name,
                    language,
                    code,
                    timeComplexity,
                    spaceComplexity,
                    explanation,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Solution not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating solution:', error);
        return NextResponse.json(
            { error: 'Failed to update solution' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await getDb();
        const result = await db
            .collection(COLLECTIONS.SOLUTIONS)
            .deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Solution not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting solution:', error);
        return NextResponse.json(
            { error: 'Failed to delete solution' },
            { status: 500 }
        );
    }
}
