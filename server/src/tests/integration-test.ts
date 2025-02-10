import { db } from '../db/index.js';

async function testIntegration() {
  try {
    console.log('🔍 Starting integration tests...\n');

    // Test 1: Create User
    console.log('Test 1: Creating User');
    const userData = {
      walletAddress: '0xtest123',
      username: 'TestUser'
    };
    const userResult = await db.query(`
      INSERT INTO users (wallet_address, username)
      VALUES ($1, $2)
      ON CONFLICT (wallet_address) 
      DO UPDATE SET last_login = CURRENT_TIMESTAMP
      RETURNING *
    `, [userData.walletAddress, userData.username]);
    console.log('✅ User created:', userResult.rows[0], '\n');

    // Test 2: Join Guild
    console.log('Test 2: Joining Guild');
    await db.transaction(async (client) => {
      // First add to guild_members
      await client.query(`
        INSERT INTO guild_members (guild_id, wallet_address)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, ['DOGE', userData.walletAddress]);

      // Then update user's current guild
      await client.query(`
        UPDATE users 
        SET current_guild = $1
        WHERE wallet_address = $2
      `, ['DOGE', userData.walletAddress]);

      const memberResult = await client.query(`
        SELECT g.name, gm.name as monster_name
        FROM guild_members m
        JOIN guilds g ON g.id = m.guild_id
        JOIN guild_monsters gm ON gm.guild_id = g.id
        WHERE m.wallet_address = $1
      `, [userData.walletAddress]);
      
      console.log('✅ Guild joined:', memberResult.rows[0], '\n');
    });

    // Test 3: Update Stats
    console.log('Test 3: Updating User Stats');
    const battleResult = {
      won: true,
      earnings: 100
    };
    
    await db.transaction(async (client) => {
      const result = await client.query(`
        UPDATE users 
        SET 
          battle_wins = battle_wins + $1,
          battle_losses = battle_losses + $2,
          total_earnings = total_earnings + $3,
          experience = experience + $4
        WHERE wallet_address = $5
        RETURNING *
      `, [
        battleResult.won ? 1 : 0,
        battleResult.won ? 0 : 1,
        battleResult.earnings,
        battleResult.won ? 100 : 50,
        userData.walletAddress
      ]);
      console.log('✅ Stats updated:', result.rows[0], '\n');

      // Check for level up
      if (result.rows[0].experience >= result.rows[0].level * 100) {
        await client.query(`
          UPDATE users 
          SET 
            level = level + 1,
            experience = 0,
            rank = CASE 
              WHEN level + 1 >= 10 THEN 'Master'
              WHEN level + 1 >= 5 THEN 'Expert'
              ELSE 'Novice'
            END
          WHERE wallet_address = $1
        `, [userData.walletAddress]);
        console.log('✅ Level up processed\n');
      }
    });

    // Test 4: Verify Final State
    console.log('Test 4: Verifying Final State');
    const finalState = await db.query(`
      SELECT 
        u.*,
        g.name as guild_name,
        g.treasury as guild_treasury,
        gm.name as monster_name
      FROM users u
      LEFT JOIN guilds g ON u.current_guild = g.id
      LEFT JOIN guild_monsters gm ON g.id = gm.guild_id
      WHERE u.wallet_address = $1
    `, [userData.walletAddress]);
    console.log('✅ Final state:', finalState.rows[0], '\n');

    console.log('🎉 All integration tests completed successfully!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    throw err;
  } finally {
    // Cleanup
    await db.query('DELETE FROM guild_members WHERE wallet_address = $1', ['0xtest123']);
    await db.query('DELETE FROM users WHERE wallet_address = $1', ['0xtest123']);
  }
}

// Run if called directly
if (process.argv[1] === import.meta.url) {
  testIntegration()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

// Execute the test
testIntegration()
  .then(() => console.log('Integration tests completed'))
  .catch(err => console.error('Integration tests failed:', err));

export { testIntegration }; 