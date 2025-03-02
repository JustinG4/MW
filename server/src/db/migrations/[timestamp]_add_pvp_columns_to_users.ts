import { db } from '../index.js';

async function addPvPColumnsToUsers() {
  try {
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS pvp_wins INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS pvp_losses INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1
    `);
    
    console.log('Successfully added PvP columns to users table');
  } catch (err) {
    console.error('Failed to add PvP columns:', err);
    throw err;
  }
}

addPvPColumnsToUsers();