import { db } from '../index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/../../../.env` });

async function enhanceBattleTables() {
  try {
    // Add new columns to battles table
    await db.query(`
      ALTER TABLE battles
      ADD COLUMN IF NOT EXISTS winner_guild_id VARCHAR(50) REFERENCES guilds(id),
      ADD COLUMN IF NOT EXISTS loser_guild_id VARCHAR(50) REFERENCES guilds(id),
      ADD COLUMN IF NOT EXISTS winner_final_health INT NOT NULL DEFAULT 100,
      ADD COLUMN IF NOT EXISTS battle_duration_seconds INT;
    `);

    // Create battle_moves table to track detailed move history
    await db.query(`
      CREATE TABLE IF NOT EXISTS battle_moves (
        id SERIAL PRIMARY KEY,
        battle_id INT REFERENCES battles(id) ON DELETE CASCADE,
        round_number INT NOT NULL,
        player1_move VARCHAR(20) NOT NULL,
        player2_move VARCHAR(20) NOT NULL,
        player1_damage INT NOT NULL,
        player2_damage INT NOT NULL,
        player1_health INT NOT NULL,
        player2_health INT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_move_type CHECK (
          player1_move IN ('attack', 'attackLeft', 'attackRight', 'defend', 'dodge', 'dodgeLeft', 'dodgeRight', 'special') AND
          player2_move IN ('attack', 'attackLeft', 'attackRight', 'defend', 'dodge', 'dodgeLeft', 'dodgeRight', 'special')
        )
      );
    `);

    // Create indexes for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_battle_moves_battle_id ON battle_moves(battle_id);
      CREATE INDEX IF NOT EXISTS idx_battles_winner_address ON battles(winner_address);
      CREATE INDEX IF NOT EXISTS idx_battles_loser_address ON battles(loser_address);
      CREATE INDEX IF NOT EXISTS idx_battles_timestamp ON battles(timestamp);
    `);
    
    console.log('Successfully enhanced battle tables');
  } catch (err) {
    console.error('Failed to enhance battle tables:', err);
    throw err;
  }
}

enhanceBattleTables();
