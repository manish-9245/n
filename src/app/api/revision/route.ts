import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';

export async function GET() {
    try {
        const db = await getDb();

        // Get the neetcode-150 collection
        const collection = await db
            .collection(COLLECTIONS.COLLECTIONS)
            .findOne({ slug: 'neetcode-150' });

        if (!collection) {
            return NextResponse.json(
                { error: 'Collection not found' },
                { status: 404 }
            );
        }

        // Get all problems
        const problems = await db
            .collection(COLLECTIONS.PROBLEMS)
            .find({ collectionId: collection._id })
            .sort({ order: 1 })
            .toArray();

        // Get all solutions
        const solutions = await db
            .collection(COLLECTIONS.SOLUTIONS)
            .find({})
            .toArray();

        // Get all notes
        const notes = await db
            .collection(COLLECTIONS.NOTES)
            .find({})
            .toArray();

        // Create lookup maps for solutions and notes
        const solutionsByProblem: Record<string, typeof solutions> = {};
        for (const solution of solutions) {
            const key = solution.problemId.toString();
            if (!solutionsByProblem[key]) {
                solutionsByProblem[key] = [];
            }
            solutionsByProblem[key].push(solution);
        }

        const notesByProblem: Record<string, typeof notes[0]> = {};
        for (const note of notes) {
            notesByProblem[note.problemId.toString()] = note;
        }

        // Combine data
        const revisionData = problems.map(problem => ({
            ...problem,
            solutions: solutionsByProblem[problem._id.toString()] || [],
            note: notesByProblem[problem._id.toString()] || null,
        }));

        return NextResponse.json(revisionData);
    } catch (error) {
        console.error('Error fetching revision data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch revision data' },
            { status: 500 }
        );
    }
}
