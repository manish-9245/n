import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'neetcode_tracker';

async function fixIndexes() {
    console.log('🔧 Fixing indexes...');
    const client = new MongoClient(MONGODB_URI!);

    try {
        await client.connect();
        const db = client.db(DB_NAME);

        // Drop all indexes on solutions to be safe and recreate
        console.log('Dropping existing indexes on solutions...');
        try {
            await db.collection('solutions').dropIndexes();
        } catch (e) {
            console.log('No indexes to drop or collection empty');
        }

        console.log('Creating new non-unique indexes...');
        await db.collection('solutions').createIndex({ problemId: 1 });
        await db.collection('solutions').createIndex({ problemId: 1, language: 1 });

        console.log('✅ Indexes updated');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

fixIndexes();
