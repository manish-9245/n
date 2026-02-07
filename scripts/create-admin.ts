import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
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

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error('Please add MONGODB_URI to .env.local');
const DB_NAME = process.env.MONGODB_DB || 'neetcode_tracker';

async function createAdmin() {
    console.log('👤 Creating admin user...');

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);

        // Remove existing admin if any
        await db.collection('users').deleteOne({ username: 'admin' });

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = {
            username: 'admin',
            email: 'admin@neetcode.local',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection('users').insertOne(adminUser);
        console.log('✅ Created admin user: admin / admin123');

        // Create index on username
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        console.log('✅ Created unique index on username');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

createAdmin();
