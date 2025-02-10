import { startTestServer, stopTestServer } from './test-utils.js';

// Remove node-fetch import and use native fetch
interface Guild {
  id: string;
  name: string;
  description: string;
  memecoin: string;
  entry_fee: number;
  treasury: number;
  established: string;
  mascot_image: string;
  monster_name: string;
  base_health: number;
  base_attack: number;
  base_defense: number;
  base_speed: number;
}

interface APIResponse {
  error?: string;
  success?: boolean;
}

async function testAPI() {
  let server;
  try {
    console.log('🔍 Starting API tests...\n');
    
    // Start test server
    server = await startTestServer();
    const baseUrl = 'http://localhost:3000/api';

    // Test 1: Create User
    console.log('Test 1: Creating User');
    const userData = {
      walletAddress: '0xtest123',
      username: 'TestUser'
    };
    const userResponse = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const userResult = await userResponse.json();
    console.log('✅ User created:', userResult, '\n');

    // Test 2: Fetch Guilds
    console.log('Test 2: Fetching Guilds');
    const guildsResponse = await fetch(`${baseUrl}/guilds`);
    const guilds = await guildsResponse.json();
    console.log('✅ Found guilds:', guilds.length, '\n');

    // Test 3: Join Guild
    console.log('Test 3: Joining Guild');
    const joinResponse = await fetch(`${baseUrl}/guilds/DOGE/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: userData.walletAddress })
    });
    const joinResult = await joinResponse.json();
    console.log('✅ Joined guild:', joinResult, '\n');

    // Test 4: Record Battle
    console.log('Test 4: Recording Battle');
    const battleResponse = await fetch(`${baseUrl}/guilds/DOGE/battles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ won: true, earnings: 100 })
    });
    const battleResult = await battleResponse.json();
    console.log('✅ Battle recorded:', battleResult, '\n');

    console.log('🎉 All API tests completed successfully!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    throw err;
  } finally {
    // Stop test server
    if (server) {
      await stopTestServer();
    }
  }
}

// Run if called directly
if (process.argv[1] === import.meta.url) {
  testAPI()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

export { testAPI }; 
testAPI(); 