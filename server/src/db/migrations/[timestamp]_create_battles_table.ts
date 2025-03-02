import { db } from '../index.js';

async function createBattlesTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS battles (
        id SERIAL PRIMARY KEY,
        mode VARCHAR(10) NOT NULL CHECK (mode IN ('PVP', 'PVE')),
        winner_address VARCHAR(42) REFERENCES users(wallet_address),
        loser_address VARCHAR(42) REFERENCES users(wallet_address),
        guild_id VARCHAR(50) REFERENCES guilds(id),
        earnings BIGINT NOT NULL,
        winner_health INT NOT NULL,
        loser_health INT NOT NULL,
        total_rounds INT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Successfully created battles table');
  } catch (err) {
    console.error('Failed to create battles table:', err);
    throw err;
  }
}

createBattlesTable(); 