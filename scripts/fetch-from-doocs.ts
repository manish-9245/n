
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { neetcode150Problems } from '../src/data/neetcode150';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Please add MONGODB_URI to .env.local');
const DB_NAME = process.env.MONGODB_DB || 'neetcode_tracker';
const DOOCS_BASE = 'https://raw.githubusercontent.com/doocs/leetcode/main/solution';
const MAPPING_URL = 'https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchMapping() {
    console.log('📥 Fetching ID mapping...');
    const res = await fetch(MAPPING_URL);
    if (!res.ok) throw new Error('Failed to fetch mapping');
    return await res.json();
}

async function fetchDoocsDescription(id: string, title: string): Promise<string | null> {
    const rangeStart = Math.floor(parseInt(id) / 100) * 100;
    const rangeEnd = rangeStart + 99;
    const range = `${rangeStart.toString().padStart(4, '0')}-${rangeEnd.toString().padStart(4, '0')}`;

    // Doocs naming convention: [ID].[Title]
    // Spaces strings are URL encoded automatically by fetch usually? No, fetch expects valid URL.
    // GitHub raw URLs use %20 for spaces.
    const encodedTitle = encodeURIComponent(title).replace(/%2C/g, ',') // Doocs might keep commas unencoded?
        .replace(/'/g, '%27'); // Special chars?

    // Actually, Doocs seems to use the exact filename from the repo, which is "ID.Title".
    // "Two Sum II - Input Array Is Sorted" -> "Two%20Sum%20II%20-%20Input%20Array%20Is%20Sorted"
    // encodeURIComponent handles spaces as %20.

    // Note: Some titles might have specialized characters.
    // Let's try standard encoding first.

    const url = `${DOOCS_BASE}/${range}/${id}.${encodedTitle}/README_EN.md`;

    try {
        const res = await fetch(url);
        if (res.ok) return await res.text();

        // Fallback: Try with just README.md if EN doesn't exist? (Though we found EN exists)
        if (res.status === 404) {
            const urlDefault = `${DOOCS_BASE}/${range}/${id}.${encodedTitle}/README.md`;
            const resDefault = await fetch(urlDefault);
            if (resDefault.ok) return await resDefault.text();
        }

        console.warn(`  404: ${url}`);
        return null;
    } catch (e) {
        console.error(`  Error: ${e}`);
        return null;
    }
}

async function main() {
    console.log('🚀 Starting Doocs fetch...');

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ DB Connected');
    const db = client.db(DB_NAME);

    const mapping = await fetchMapping();
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Create Map: Normalized Title -> ID (e.g. "0001")
    const titleToId = new Map(mapping.map((item: any) => {
        const code = item.code;
        if (!code) return [item.problem ? normalize(item.problem) : '', null];
        const id = code.split('-')[0];
        return [item.problem ? normalize(item.problem) : '', id];
    }));

    let updated = 0;
    let failed = 0;

    for (const problem of neetcode150Problems) {
        process.stdout.write(`Processing "${problem.title}" ... `);

        const id = titleToId.get(normalize(problem.title));
        if (!id) {
            console.log('❌ No ID found in mapping');
            failed++;
            continue;
        }

        const description = await fetchDoocsDescription(id as string, problem.title);

        if (description) {
            // Check if description is actually English?
            // "Given an array" vs "给定"
            // We specifically fetched README_EN.md, so it should be fine.
            // But if we fell back to README.md, it might be Chinese.

            await db.collection('problems').updateOne(
                { title: problem.title },
                { $set: { description, updatedAt: new Date(), leetcodeId: id } }
            );
            console.log('✅ Updated');
            updated++;
        } else {
            console.log('❌ Failed to fetch');
            failed++;
        }

        // Small delay to be nice to GitHub
        await delay(200);
    }

    console.log(`\n🎉 Done! Updated: ${updated}, Failed: ${failed}`);
    await client.close();
}

main();
