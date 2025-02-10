import { db } from '../db/index.js';

async function testDatabase() {
  try {
    console.log('🔍 Starting database tests...\n');

    // Test connection
    console.log('Test 1: Database Connection');
    const result = await db.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    // Test guild queries
    console.log('Test 2: Guild Queries');
    const guilds = await db.query('SELECT * FROM guilds');
    console.log('✅ Found', guilds.rows.length, 'guilds\n');

    // Test user creation
    console.log('Test 3: User Creation');
    const testUser = {
      walletAddress: '0xtest123',
      username: 'TestUser'
    };
    await db.query(`
      INSERT INTO users (wallet_address, username)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [testUser.walletAddress, testUser.username]);
    console.log('✅ Test user created\n');

    // Cleanup
    await db.query('DELETE FROM users WHERE wallet_address = $1', [testUser.walletAddress]);
    console.log('🧹 Test data cleaned up\n');

    console.log('🎉 All database tests passed!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    throw err;
  }
}

// Run if called directly
if (process.argv[1] === import.meta.url) {
  testDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

export { testDatabase }; 