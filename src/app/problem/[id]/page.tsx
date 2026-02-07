import { getDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/types';
import { ObjectId } from 'mongodb';
import ProblemClient from './ProblemClient';
import { notFound } from 'next/navigation';

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!ObjectId.isValid(id)) {
      return notFound();
  }
  
  const db = await getDb();
  const problemObjectId = new ObjectId(id);

  try {
    const [problem, solutions, note] = await Promise.all([
      db.collection(COLLECTIONS.PROBLEMS).findOne({ _id: problemObjectId }),
      db.collection(COLLECTIONS.SOLUTIONS).find({ problemId: problemObjectId }).toArray(),
      db.collection(COLLECTIONS.NOTES).findOne({ problemId: problemObjectId })
    ]);

    if (!problem) {
      return notFound();
    }

    // Serialize data: Convert ObjectId to string and Date to string
    // JSON.parse(JSON.stringify(x)) is a simple way to achieve this for Props
    const serializedProblem = JSON.parse(JSON.stringify(problem));
    const serializedSolutions = JSON.parse(JSON.stringify(solutions));
    const serializedNote = note ? JSON.parse(JSON.stringify(note)) : null;

    return (
      <ProblemClient 
        initialProblem={serializedProblem}
        initialSolutions={serializedSolutions}
        initialNote={serializedNote}
        problemId={id}
      />
    );
  } catch (error) {
    console.error('Error fetching problem data:', error);
    throw error; // Let Next.js handle error boundary
  }
}
