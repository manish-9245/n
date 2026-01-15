import { compare } from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local manually to ensure we see what's on disk
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`\n🔍 Checking .env.local at: ${envPath}`);

if (fs.existsSync(envPath)) {
    console.log('✅ File exists');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    // Apply to process.env
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.error('❌ .env.local does not exist!');
}

async function debugAuth() {
    console.log('\n🔐 Auth Debugger');
    console.log('----------------');

    const hash = process.env.ADMIN_PASSWORD_HASH;

    if (!hash) {
        console.error('❌ ADMIN_PASSWORD_HASH is NOT set in environment variables');
        return;
    }

    console.log('✅ ADMIN_PASSWORD_HASH is present');
    console.log(`   Value prefix: ${hash.substring(0, 10)}...`);

    const password = 'admin123';
    console.log(`\n🔑 Testing password: "${password}"`);

    try {
        const isValid = await compare(password, hash);
        if (isValid) {
            console.log('✅ Success! The password matches the hash.');
        } else {
            console.error('❌ Failed! The password does NOT match the hash.');
            console.log('   The hash in your .env.local might be for a different password.');
        }
    } catch (error) {
        console.error('❌ Error comparing hash:', error);
    }
}

debugAuth();
