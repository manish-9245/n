
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:jEqCZWooNIPfcjfipzPXCwPWxOOHiHOK@nozomi.proxy.rlwy.net:12346';
const DB_NAME = process.env.MONGODB_DB || 'neetcode_tracker';

async function check() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const p = await db.collection('problems').findOne({ title: 'Contains Duplicate' });
    console.log(JSON.stringify(p?.description, null, 2));
    await client.close();
}
check();
