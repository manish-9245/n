import { MongoClient, ObjectId } from 'mongodb';
import { neetcode150Problems, generateProblemId, generateTemplateDescription } from '../src/data/neetcode150';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:jEqCZWooNIPfcjfipzPXCwPWxOOHiHOK@nozomi.proxy.rlwy.net:12346';
const DB_NAME = process.env.MONGODB_DB || 'neetcode_tracker';

async function seed() {
    console.log('🌱 Starting database seed...');

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);

        // Drop existing collections (optional - comment out if you want to preserve data)
        console.log('🗑️  Dropping existing collections...');
        await db.collection('collections').deleteMany({});
        await db.collection('problems').deleteMany({});
        await db.collection('solutions').deleteMany({});
        await db.collection('notes').deleteMany({});

        // Create NeetCode 150 collection
        console.log('📦 Creating NeetCode 150 collection...');
        const categories = [...new Set(neetcode150Problems.map(p => p.category))];

        const collectionDoc = {
            slug: 'neetcode-150',
            name: 'NeetCode 150',
            description: 'A curated list of 150 essential LeetCode problems covering all major topics and patterns for technical interviews.',
            problemCount: 150,
            categories,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const collectionResult = await db.collection('collections').insertOne(collectionDoc);
        const collectionId = collectionResult.insertedId;
        console.log(`✅ Created collection: ${collectionDoc.name} (ID: ${collectionId})`);

        // Create problems
        console.log('📝 Creating 150 problems...');
        const problemDocs = neetcode150Problems.map(p => ({
            collectionId,
            problemId: generateProblemId(p.title),
            title: p.title,
            difficulty: p.difficulty as 'Easy' | 'Medium' | 'Hard',
            category: p.category,
            description: generateTemplateDescription(p.title, p.difficulty),
            examples: [],
            constraints: [],
            leetcodeUrl: `https://leetcode.com/problems/${generateProblemId(p.title)}/`,
            order: p.order,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await db.collection('problems').insertMany(problemDocs);
        console.log(`✅ Created ${problemDocs.length} problems`);

        // Create indexes for performance
        console.log('🔍 Creating indexes...');

        // Collections indexes
        await db.collection('collections').createIndex({ slug: 1 }, { unique: true });

        // Problems indexes
        await db.collection('problems').createIndex({ collectionId: 1, problemId: 1 }, { unique: true });
        await db.collection('problems').createIndex({ collectionId: 1, category: 1 });
        await db.collection('problems').createIndex({ collectionId: 1, order: 1 });

        // Solutions indexes
        await db.collection('solutions').createIndex({ problemId: 1 });
        await db.collection('solutions').createIndex({ problemId: 1, language: 1 }); // Not unique anymore

        // Notes indexes
        await db.collection('notes').createIndex({ problemId: 1 }, { unique: true });

        console.log('✅ Created all indexes');

        // Print summary
        console.log('\n📊 Seed Summary:');
        console.log(`   Collections: 1`);
        console.log(`   Problems: ${problemDocs.length}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   \n   Categories: ${categories.join(', ')}`);

        console.log('\n✨ Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

seed();
