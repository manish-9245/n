import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS, Solution } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { estimateComplexity } from '@/lib/gemini';

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
        const solutions = await db
            .collection(COLLECTIONS.SOLUTIONS)
            .find({ problemId: new ObjectId(problemId) })
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(solutions);
    } catch (error) {
        console.error('Error fetching solutions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch solutions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { problemId, name, language, code, timeComplexity, spaceComplexity, explanation } = body;

        if (!problemId || !language || !code) {
            return NextResponse.json(
                { error: 'problemId, language, and code are required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const solution: Omit<Solution, '_id'> = {
            problemId: new ObjectId(problemId),
            name,
            language,
            code,
            timeComplexity,
            spaceComplexity,
            explanation,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // If complexity is missing, try to estimate it using AI
        if (!timeComplexity || !spaceComplexity) {
            try {
                const aiEstimates = await estimateComplexity(code, language);
                if (aiEstimates) {
                    if (!timeComplexity && aiEstimates.timeComplexity) {
                        solution.timeComplexity = aiEstimates.timeComplexity;
                    }
                    if (!spaceComplexity && aiEstimates.spaceComplexity) {
                        solution.spaceComplexity = aiEstimates.spaceComplexity;
                    }
                }
            } catch (err) {
                console.error('Failed to estimate complexity:', err);
                // Continue without complexity if AI fails
            }
        }

        const result = await db.collection(COLLECTIONS.SOLUTIONS).insertOne(solution);

        return NextResponse.json(
            { ...solution, _id: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating solution:', error);
        return NextResponse.json(
            { error: 'Failed to create solution' },
            { status: 500 }
        );
    }
}
