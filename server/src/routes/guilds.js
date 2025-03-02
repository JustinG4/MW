import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// Add a basic GET endpoint for /api/guilds
router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM guilds');
      res.json(result.rows);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Connection error' });
  }
});

// Add endpoint to join a guild
router.post('/:guildId/join', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { userAddress } = req.body;
    
    if (!guildId || !userAddress) {
      return res.status(400).json({ error: 'Guild ID and user address are required' });
    }

    const client = await pool.connect();
    try {
      // Check if guild exists
      const guildResult = await client.query('SELECT * FROM guilds WHERE id = $1', [guildId]);
      if (guildResult.rows.length === 0) {
        return res.status(404).json({ error: 'Guild not found' });
      }

      // Check if user exists
      const userResult = await client.query('SELECT * FROM users WHERE wallet_address = $1', [userAddress]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user's guild
      await client.query(
        'UPDATE users SET current_guild = $1 WHERE wallet_address = $2',
        [guildId, userAddress]
      );

      res.json({ 
        message: 'Successfully joined guild',
        guild: guildResult.rows[0]
      });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error joining guild:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this endpoint to check guild stats
router.get('/:guildId/debug-stats', async (req, res) => {
  const { guildId } = req.params;
  
  try {
    const client = await pool.connect();
    try {
      // Get guild stats
      const statsResult = await client.query(`
        SELECT * FROM guild_stats WHERE guild_id = $1
      `, [guildId]);
      
      // Get guild info
      const guildResult = await client.query(`
        SELECT * FROM guilds WHERE id = $1
      `, [guildId]);
      
      // Get battle count
      const battlesResult = await client.query(`
        SELECT 
          COUNT(*) FILTER (WHERE winner_guild = $1) as wins,
          COUNT(*) as total_battles
        FROM battles 
        WHERE winner_guild = $1 OR loser_guild = $1
      `, [guildId]);
      
      res.json({
        success: true,
        guildId,
        exists: statsResult.rows.length > 0,
        stats: statsResult.rows[0] || null,
        guild: guildResult.rows[0] || null,
        battles: battlesResult.rows[0] || null
      });
    } catch (err) {
      console.error('Database error:', err);
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