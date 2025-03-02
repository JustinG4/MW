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

// Add endpoint to get guild leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      // Get all guilds with their stats
      const leaderboardResult = await client.query(`
        SELECT 
          g.id, 
          g.name, 
          g.memecoin,
          g.mascot_image,
          COALESCE(gs.guild_points, 0) as points,
          COALESCE(gs.total_pvp_wins, 0) as pvp_wins,
          COALESCE(gs.total_pve_wins, 0) as pve_wins,
          COUNT(u.wallet_address) as member_count,
          CASE 
            WHEN (COALESCE(gs.total_pvp_battles, 0) + COALESCE(gs.total_pve_battles, 0)) = 0 THEN 0
            ELSE ROUND(((COALESCE(gs.total_pvp_wins, 0) + COALESCE(gs.total_pve_wins, 0))::float / 
                      (COALESCE(gs.total_pvp_battles, 0) + COALESCE(gs.total_pve_battles, 0))) * 100)
          END as win_rate,
          COALESCE(gs.total_pvp_battles, 0) + COALESCE(gs.total_pve_battles, 0) as total_battles
        FROM 
          guilds g
        LEFT JOIN 
          guild_stats gs ON g.id = gs.guild_id
        LEFT JOIN 
          users u ON g.id = u.current_guild
        GROUP BY 
          g.id, g.name, g.memecoin, g.mascot_image, gs.guild_points, gs.total_pvp_wins, gs.total_pve_wins,
          gs.total_pvp_battles, gs.total_pve_battles
        ORDER BY 
          points DESC
      `);
      
      // Calculate total prize pool (sum of all guild treasuries)
      const prizePoolResult = await client.query(`
        SELECT SUM(treasury) as total_prize_pool
        FROM guilds
      `);
      
      // Format the response to match what the client expects
      const formattedGuilds = leaderboardResult.rows.map(guild => ({
        name: guild.name,
        points: guild.points,
        memberCount: parseInt(guild.member_count),
        winRate: parseInt(guild.win_rate),
        totalBattles: parseInt(guild.total_battles),
        mascotImage: guild.mascot_image
      }));
      
      res.json({
        guilds: formattedGuilds,
        prizePool: Number(prizePoolResult.rows[0].total_prize_pool || 0) / 1e9
      });
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

// Add endpoint to get guild stats
router.get('/:guildId/stats', async (req, res) => {
  const { guildId } = req.params;
  
  try {
    const client = await pool.connect();
    try {
      // Get guild info
      const guildResult = await client.query(`
        SELECT * FROM guilds WHERE id = $1
      `, [guildId]);
      
      if (guildResult.rows.length === 0) {
        return res.status(404).json({ error: 'Guild not found' });
      }
      
      // Get guild stats
      const statsResult = await client.query(`
        SELECT * FROM guild_stats WHERE guild_id = $1
      `, [guildId]);
      
      // Get member count
      const memberCountResult = await client.query(`
        SELECT COUNT(*) as member_count FROM users WHERE current_guild = $1
      `, [guildId]);
      
      // Get battle stats
      const battleStatsResult = await client.query(`
        SELECT 
          COUNT(*) FILTER (WHERE winner_guild = $1) as wins,
          COUNT(*) as total_battles
        FROM battles 
        WHERE winner_guild = $1 OR loser_guild = $1
      `, [guildId]);
      
      // Get top members
      const topMembersResult = await client.query(`
        SELECT username, wallet_address, level, experience 
        FROM users 
        WHERE current_guild = $1 
        ORDER BY experience DESC 
        LIMIT 5
      `, [guildId]);
      
      const guildStats = {
        guild: guildResult.rows[0],
        stats: statsResult.rows[0] || {
          guild_id: guildId,
          weekly_pvp_wins: 0,
          weekly_pve_wins: 0,
          total_pvp_wins: 0,
          total_pve_wins: 0,
          weekly_pvp_battles: 0,
          weekly_pve_battles: 0,
          total_pvp_battles: 0,
          total_pve_battles: 0,
          guild_points: 0
        },
        memberCount: parseInt(memberCountResult.rows[0].member_count),
        battleStats: battleStatsResult.rows[0],
        topMembers: topMembersResult.rows
      };
      
      res.json(guildStats);
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

export default router; 