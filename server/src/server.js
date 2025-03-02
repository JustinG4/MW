const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'memeworld',
  password: 'postgres',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize user
app.post('/api/users', async (req, res) => {
  const { walletAddress, username } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (wallet_address, username) VALUES ($1, $2) ON CONFLICT (wallet_address) DO UPDATE SET username = $2',
      [walletAddress, username]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error initializing user:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get guilds
app.get('/api/guilds', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM guilds');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching guilds:', err);
    res.status(500).json({ error: err.message });
  }
});

// Join guild
app.post('/api/guilds/:guildId/join', async (req, res) => {
  const { guildId } = req.params;
  const { walletAddress } = req.body;
  
  try {
    // Start transaction
    await pool.query('BEGIN');
    
    // Add user to guild_members
    await pool.query(
      'INSERT INTO guild_members (guild_id, wallet_address) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [guildId, walletAddress]
    );
    
    // Update user's current guild
    await pool.query(
      'UPDATE users SET current_guild = $1 WHERE wallet_address = $2',
      [guildId, walletAddress]
    );
    
    await pool.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error joining guild:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user guild
app.post('/api/users/:walletAddress/guild', async (req, res) => {
  const { walletAddress } = req.params;
  const { guildId } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE users SET current_guild = $1 WHERE wallet_address = $2 RETURNING *',
      [guildId, walletAddress]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Error updating user guild:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Record battle
app.post('/api/battles', async (req, res) => {
  const { gameMode, winnerAddress, loserAddress, winnerGuild, loserGuild, totalRounds, winnerFinalHealth, earnings, moves } = req.body;
  
  try {
    // Start transaction
    await pool.query('BEGIN');
    
    // Insert battle record
    const battleResult = await pool.query(
      `INSERT INTO battles 
       (game_mode, winner_address, loser_address, winner_guild, loser_guild, total_rounds, winner_final_health, earnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING battle_id`,
      [gameMode, winnerAddress, loserAddress, winnerGuild, loserGuild, totalRounds, winnerFinalHealth, earnings]
    );
    
    const battleId = battleResult.rows[0].battle_id;
    
    // Insert battle moves
    if (moves && moves.length > 0) {
      for (const move of moves) {
        await pool.query(
          `INSERT INTO battle_moves 
           (battle_id, round_number, attacker_address, move_name, damage_dealt)
           VALUES ($1, $2, $3, $4, $5)`,
          [battleId, move.roundNumber, move.player1Move, move.player2Move, move.damage1]
        );
      }
    }
    
    await pool.query('COMMIT');
    res.json({ success: true, battleId });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error recording battle:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user stats
app.post('/api/users/:walletAddress/stats', async (req, res) => {
  const { walletAddress } = req.params;
  const { won, earnings } = req.body;
  
  try {
    await pool.query('BEGIN');
    
    // Update user stats
    await pool.query(
      `UPDATE user_stats 
       SET 
         pvp_wins = CASE WHEN $1 THEN pvp_wins + 1 ELSE pvp_wins END,
         pvp_losses = CASE WHEN NOT $1 THEN pvp_losses + 1 ELSE pvp_losses END,
         total_earnings = total_earnings + $2,
         weekly_earnings = weekly_earnings + $2,
         weekly_pvp_wins = CASE WHEN $1 THEN weekly_pvp_wins + 1 ELSE weekly_pvp_wins END
       WHERE wallet_address = $3`,
      [won, earnings, walletAddress]
    );
    
    await pool.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error updating user stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
