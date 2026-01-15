const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log(`\nPassword: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('\nAdd this to your .env.local:');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
}

generateHash();
