import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';
import { RevisionClient } from './RevisionClient';

// Server Component
export default async function RevisionPage() {
    const db = await getDb();

    // Get the neetcode-150 collection
    const collection = await db
        .collection(COLLECTIONS.COLLECTIONS)
        .findOne({ slug: 'neetcode-150' });

    if (!collection) {
        return <div>Collection not found</div>;
    }

    // Parallel data fetching for performance
    const [problems, solutions, notes] = await Promise.all([
        db.collection(COLLECTIONS.PROBLEMS)
            .find({ collectionId: collection._id })
            .sort({ order: 1 })
            .toArray(),
        db.collection(COLLECTIONS.SOLUTIONS)
            .find({})
            .toArray(),
        db.collection(COLLECTIONS.NOTES)
            .find({})
            .toArray()
    ]);

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

    // Combine data - SERIALIZE data for client component
    // We must ensure _id and other ObjectIds are converted to strings if necessary, 
    // but Next.js Server Components serialize props automatically for Client Components.
    // However, MongoDB returns objects with `_id` as ObjectId, which might cause warnings or errors if passed directly.
    // It is best practice to map them to simple objects.

    const revisionData = problems.map(problem => ({
        ...problem,
        _id: problem._id.toString(),
        collectionId: problem.collectionId?.toString(),
        solutions: (solutionsByProblem[problem._id.toString()] || []).map(s => ({
            ...s,
            _id: s._id.toString(),
            problemId: s.problemId.toString(),
        })),
        note: notesByProblem[problem._id.toString()] 
            ? { ...notesByProblem[problem._id.toString()], _id: notesByProblem[problem._id.toString()]._id.toString(), problemId: notesByProblem[problem._id.toString()].problemId.toString() }
            : null,
    }));

    return <RevisionClient problems={revisionData as any} />;
}
