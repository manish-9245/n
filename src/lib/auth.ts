import bcrypt from 'bcryptjs';

import { getDb } from './mongodb';
import { COLLECTIONS, User } from './types';

export async function verifyPassword(password: string): Promise<User | null> {
    const db = await getDb();
    const user = await db.collection<User>(COLLECTIONS.USERS).findOne({ username: 'admin' });

    if (!user) {
        return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}
