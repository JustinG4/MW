import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

router.post('/', async (req, res) => {
  // Extract battle data
  const { 
    gameMode, 
    winnerAddress, 
    loserAddress, 
    winnerGuild, 
    loserGuild, 
    totalRounds, 
    winnerFinalHealth, 
    earnings,
    moves,
    // Extract guild stats update info
    updateGuildStats = true,
    winnerPoints = gameMode === 'PVP' ? 10 : 5,
    loserPoints = gameMode === 'PVP' ? 1 : 0
  } = req.body;
  
  console.log('Recording battle with guild stats update:', {
    gameMode, winnerGuild, loserGuild, updateGuildStats, winnerPoints, loserPoints
  });
  
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Record the battle as usual
      const battleResult = await client.query(`
        INSERT INTO battles (
          game_mode, winner_address, loser_address, winner_guild, loser_guild, 
          total_rounds, winner_final_health, earnings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING battle_id
      `, [
        gameMode, winnerAddress, loserAddress, winnerGuild, loserGuild, 
        totalRounds, winnerFinalHealth, earnings
      ]);
      
      const battleId = battleResult.rows[0].battle_id;
      
      // Record battle moves
      if (moves && moves.length > 0) {
        for (let i = 0; i < moves.length; i++) {
          const move = moves[i];
          await client.query(`
            INSERT INTO battle_moves (
              battle_id, round_number, move_sequence, 
              player1_move, player2_move, 
              player1_damage, player2_damage, 
              player1_health, player2_health
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            battleId, move.roundNumber, i + 1, // Use index + 1 as move_sequence to ensure uniqueness
            move.player1Move, move.player2Move,
            move.player1Damage, move.player2Damage,
            move.player1Health, move.player2Health
          ]);
        }
      }
      
      // Update user stats
      // ... existing user stats update code ...
      
      // Update guild stats if requested
      if (updateGuildStats) {
        console.log('Updating guild stats as part of battle recording');
        
        // Update winner guild stats
        if (winnerGuild) {
          console.log(`Updating winner guild ${winnerGuild} with ${winnerPoints} points`);
          
          // Check if guild_stats record exists
          const checkResult = await client.query(
            'SELECT 1 FROM guild_stats WHERE guild_id = $1', 
            [winnerGuild]
          );
          
          if (checkResult.rows.length === 0) {
            // Create guild_stats record if it doesn't exist
            console.log(`Creating guild_stats record for ${winnerGuild}`);
            await client.query(
              'INSERT INTO guild_stats (guild_id) VALUES ($1)',
              [winnerGuild]
            );
          }
          
          // Update the stats
          if (gameMode === 'PVP') {
            await client.query(`
              UPDATE guild_stats 
              SET 
                weekly_pvp_wins = weekly_pvp_wins + 1,
                total_pvp_wins = total_pvp_wins + 1,
                weekly_pvp_battles = weekly_pvp_battles + 1,
                total_pvp_battles = total_pvp_battles + 1,
                guild_points = guild_points + $1
              WHERE guild_id = $2
            `, [winnerPoints, winnerGuild]);
          } else {
            await client.query(`
              UPDATE guild_stats 
              SET 
                weekly_pve_wins = weekly_pve_wins + 1,
                total_pve_wins = total_pve_wins + 1,
                weekly_pve_battles = weekly_pve_battles + 1,
                total_pve_battles = total_pve_battles + 1,
                guild_points = guild_points + $1
              WHERE guild_id = $2
            `, [winnerPoints, winnerGuild]);
          }
        }
        
        // Update loser guild stats for PVP
        if (gameMode === 'PVP' && loserGuild) {
          console.log(`Updating loser guild ${loserGuild} with ${loserPoints} points`);
          
          // Check if guild_stats record exists
          const checkResult = await client.query(
            'SELECT 1 FROM guild_stats WHERE guild_id = $1', 
            [loserGuild]
          );
          
          if (checkResult.rows.length === 0) {
            // Create guild_stats record if it doesn't exist
            console.log(`Creating guild_stats record for ${loserGuild}`);
            await client.query(
              'INSERT INTO guild_stats (guild_id) VALUES ($1)',
              [loserGuild]
            );
          }
          
          await client.query(`
            UPDATE guild_stats 
            SET 
              weekly_pvp_battles = weekly_pvp_battles + 1,
              total_pvp_battles = total_pvp_battles + 1,
              guild_points = guild_points + $1
            WHERE guild_id = $2
          `, [loserPoints, loserGuild]);
        }
      }
      
      await client.query('COMMIT');
      
      res.json({ success: true, battleId });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error recording battle:', err);
      res.status(500).json({ success: false, error: err.message });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ success: false, error: 'Database connection error' });
  }
});

export default router; 