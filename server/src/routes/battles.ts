import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// Record a new battle
router.post('/', async (req, res) => {
  console.log('Received battle data:', JSON.stringify(req.body, null, 2));
  const {
    gameMode,
    winnerAddress,
    loserAddress,
    winnerGuild,
    loserGuild,
    totalRounds,
    winnerFinalHealth,
    earnings,
    moves
  } = req.body;

  try {
    // Start a transaction since we're making multiple related inserts
    await db.query('BEGIN');
    console.log('Starting transaction to record battle');

    // Insert battle record
    const battleResult = await db.query(
      `INSERT INTO battles (
        game_mode, 
        winner_address, 
        loser_address, 
        winner_guild,
        loser_guild,
        winner_final_health,
        total_rounds,
        earnings
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING battle_id`,
      [
        gameMode.toUpperCase(),
        winnerAddress,
        loserAddress,
        winnerGuild,
        loserGuild,
        winnerFinalHealth,
        totalRounds,
        earnings
      ]
    );

    const battleId = battleResult.rows[0].battle_id;

    // Insert battle moves
    let moveSequence = 0;
    for (const move of moves) {
      moveSequence++;
      await db.query(
        `INSERT INTO battle_moves (
          battle_id,
          round_number,
          move_sequence,
          player1_move,
          player2_move,
          player1_damage,
          player2_damage,
          player1_health,
          player2_health
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          battleId,
          move.roundNumber,
          moveSequence,
          move.player1Move,
          move.player2Move,
          move.player1Damage,
          move.player2Damage,
          move.player1Health,
          move.player2Health
        ]
      );
    }

    // Commit transaction
    await db.query('COMMIT');
    console.log('Successfully committed battle data');

    res.json({
      success: true,
      battleId
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error details:', err);
    console.error('Error recording battle:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to record battle'
    });
  }
});

// Get battle history for a user
router.get('/api/users/:address/battles', async (req, res) => {
  const { address } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  try {
    const battles = await db.query(
      `SELECT 
        b.*,
        json_agg(json_build_object(
          'roundNumber', bm.round_number,
          'player1Move', bm.player1_move,
          'player2Move', bm.player2_move,
          'player1Damage', bm.player1_damage,
          'player2Damage', bm.player2_damage,
          'player1Health', bm.player1_health,
          'player2Health', bm.player2_health
        ) ORDER BY bm.round_number) as moves
      FROM battles b
      LEFT JOIN battle_moves bm ON b.id = bm.battle_id
      WHERE b.winner_address = $1 OR b.loser_address = $1
      GROUP BY b.id
      ORDER BY b.timestamp DESC
      LIMIT $2 OFFSET $3`,
      [address, limit, offset]
    );

    res.json({
      success: true,
      battles: battles.rows
    });
  } catch (err) {
    console.error('Error fetching battle history:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch battle history'
    });
  }
});

// Get battle statistics for a user
router.get('/api/users/:address/battle-stats', async (req, res) => {
  const { address } = req.params;

  try {
    const stats = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE winner_address = $1) as total_wins,
        COUNT(*) FILTER (WHERE loser_address = $1) as total_losses,
        AVG(winner_final_health) FILTER (WHERE winner_address = $1) as avg_winning_health,
        AVG(total_rounds) as avg_battle_rounds,
        SUM(earnings) FILTER (WHERE winner_address = $1) as total_earnings,
        COUNT(DISTINCT CASE 
          WHEN winner_address = $1 THEN loser_address 
          WHEN loser_address = $1 THEN winner_address 
        END) as unique_opponents
      FROM battles 
      WHERE winner_address = $1 OR loser_address = $1`,
      [address]
    );

    // Get most used moves
    const moveStats = await db.query(
      `SELECT 
        player1_move as move,
        COUNT(*) as times_used
      FROM battle_moves bm
      JOIN battles b ON b.id = bm.battle_id
      WHERE b.winner_address = $1 OR b.loser_address = $1
      GROUP BY player1_move
      ORDER BY times_used DESC
      LIMIT 3`,
      [address]
    );

    res.json({
      success: true,
      stats: {
        ...stats.rows[0],
        favoriteMovesData: moveStats.rows
      }
    });
  } catch (err) {
    console.error('Error fetching battle stats:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch battle stats'
    });
  }
});

export default router;
