import { db } from '../index.js';

async function addSpecialMoves() {
  try {
    await db.query(`
      ALTER TABLE guild_monsters
      ADD COLUMN special_move_name VARCHAR(50) NOT NULL DEFAULT 'Special Attack',
      ADD COLUMN special_move_damage INT NOT NULL DEFAULT 50;
    `);

    // Update existing monsters with custom special moves
    await db.query(`
      UPDATE guild_monsters
      SET 
        special_move_name = CASE 
          WHEN guild_id = 'DOGE' THEN 'Much Wow Blast'
          WHEN guild_id = 'PEPE' THEN 'Rare Pepe Strike'
          ELSE special_move_name
        END
      WHERE guild_id IN ('DOGE', 'PEPE');
    `);
    
    console.log('Successfully added special moves to guild_monsters');
  } catch (err) {
    console.error('Failed to add special moves:', err);
    throw err;
  }
}

addSpecialMoves(); 