import { ObjectId } from 'mongodb';

export interface Collection {
    _id?: ObjectId;
    slug: string;
    name: string;
    description: string;
    problemCount: number;
    categories: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Problem {
    _id?: ObjectId;
    collectionId: ObjectId;
    problemId: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    description: string;
    examples: Array<{
        input: string;
        output: string;
        explanation?: string;
    }>;
    constraints: string[];
    leetcodeUrl?: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Solution {
    _id?: ObjectId;
    problemId: ObjectId;
    name?: string; // Custom solution name (e.g., "Two Pointer Approach")
    language: string;
    code: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    explanation?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Note {
    _id?: ObjectId;
    problemId: ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

// Collection names
export const COLLECTIONS = {
    COLLECTIONS: 'collections',
    PROBLEMS: 'problems',
    SOLUTIONS: 'solutions',
    NOTES: 'notes',
    USERS: 'users',
} as const;

export interface User {
    _id?: ObjectId;
    username: string;
    email: string;
    password: string; // Hashed password
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
}
