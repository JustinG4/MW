import { db } from '../index.js';

async function addPveColumns() {
  try {
    await db.query(`
      ALTER TABLE guild_stats
      ADD COLUMN pve_battles INT DEFAULT 0,
      ADD COLUMN pve_wins INT DEFAULT 0;
    `);
    
    console.log('Successfully added PvE columns to guild_stats');
  } catch (err) {
    console.error('Failed to add PvE columns:', err);
    throw err;
  }
}

addPveColumns(); 