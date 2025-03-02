// server/src/routes/guilds.ts
import express, { Request, Response, Router } from 'express';
import { db } from '../db/index.js';

const router: Router = express.Router();

// Define interfaces for request types
interface JoinGuildRequest {
  walletAddress: string;
}

interface BattleRequest {
  won: boolean;
  earnings: number;
}

interface GuildParams {
  guildId: string;
}

// Get all guilds
router.get('/', async (_req: Request, res: Response) => {
  try {
    console.log('Fetching all guilds');
    const result = await db.query(`
      SELECT g.*, 
             gm.name as monster_name, 
             gm.base_health,
             gm.base_attack,
             gm.base_defense,
             gm.base_speed
      FROM guilds g
      LEFT JOIN guild_monsters gm ON g.id = gm.guild_id
    `);
    console.log('Found guilds:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch guilds:', err);
    res.status(500).json({ error: 'Failed to fetch guilds' });
  }
});

// Join guild
router.post(
  '/:guildId/join',
  async (
    req: Request<GuildParams, any, JoinGuildRequest>,
    res: Response
  ) => {
    const { guildId } = req.params;
    const { walletAddress } = req.body;
    console.log('Join guild request:', { guildId, walletAddress });

    if (!walletAddress) {
      console.error('Missing wallet address');
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    try {
      await db.transaction(async (client) => {
        // Check if guild exists
        const guild = await client.query('SELECT * FROM guilds WHERE id = $1', [guildId]);
        console.log('Found guild:', guild.rows[0]);
        if (!guild.rows[0]) {
          throw new Error('Guild not found');
        }

        // Check if user exists
        const user = await client.query('SELECT * FROM users WHERE wallet_address = $1', [walletAddress]);
        console.log('Found user:', user.rows[0]);
        if (!user.rows[0]) {
          throw new Error('User not found');
        }

        // Add member
        await client.query(`
          INSERT INTO guild_members (guild_id, wallet_address)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [guildId, walletAddress]);
        console.log('Added member to guild');
      });

      res.json({ success: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join guild';
      console.error('Join guild error:', errorMessage);
      res.status(400).json({ error: errorMessage });
    }
  }
);

// Record battle result
router.post('/:guildId/battles', async (req: Request, res: Response) => {
  const { guildId } = req.params;
  const { won, earnings, isPvP } = req.body;

  try {
    await db.transaction(async (client) => {
      // Update guild stats
      await client.query(`
        UPDATE guild_stats 
        SET 
          weekly_battles = weekly_battles + 1,
          total_battles = total_battles + 1,
          weekly_wins = weekly_wins + $1,
          total_wins = total_wins + $1,
          weekly_earnings = weekly_earnings + $2,
          total_earnings = total_earnings + $2,
          pvp_battles = pvp_battles + $3,
          pvp_wins = pvp_wins + $4
        WHERE guild_id = $5
      `, [
        won ? 1 : 0,
        earnings,
        isPvP ? 1 : 0,
        isPvP && won ? 1 : 0,
        guildId
      ]);

      if (won) {
        await client.query(`
          UPDATE guilds 
          SET treasury = treasury + $1
          WHERE id = $2
        `, [earnings, guildId]);
      }

      await client.query('COMMIT');
      res.json({ success: true });
    });
  } catch (err) {
    console.error('Failed to record battle:', err);
    res.status(500).json({ error: 'Failed to record battle' });
  }
});

router.get('/:guildId/stats', async (req, res) => {
  try {
    const { guildId } = req.params;
    
    const stats = await db.query(`
      SELECT 
        g.id,
        g.name,
        g.mascot_image,
        g.treasury,
        COALESCE(gs.weekly_pvp_wins + gs.weekly_pve_wins, 0) as weekly_wins,
        COALESCE(gs.weekly_pvp_battles + gs.weekly_pve_battles, 0) as weekly_battles,
        COALESCE(gs.total_pvp_wins + gs.total_pve_wins, 0) as total_wins,
        COALESCE(gs.total_pvp_battles + gs.total_pve_battles, 0) as total_battles,
        COALESCE(gs.weekly_earnings, 0) as weekly_earnings,
        COALESCE(gs.total_earnings, 0) as total_earnings,
        COUNT(gm.wallet_address) as member_count,
        CASE 
          WHEN (gs.weekly_pvp_battles + gs.weekly_pve_battles) = 0 THEN 0
          ELSE ROUND(((gs.weekly_pvp_wins + gs.weekly_pve_wins)::float / 
                    (gs.weekly_pvp_battles + gs.weekly_pve_battles)) * 100)
        END as win_rate
      FROM guilds g
      LEFT JOIN guild_stats gs ON g.id = gs.guild_id
      LEFT JOIN guild_members gm ON g.id = gm.guild_id
      WHERE g.id = $1
      GROUP BY 
        g.id, g.name, g.mascot_image, g.treasury,
        gs.weekly_pvp_wins, gs.weekly_pve_wins,
        gs.weekly_pvp_battles, gs.weekly_pve_battles,
        gs.total_pvp_wins, gs.total_pve_wins,
        gs.total_pvp_battles, gs.total_pve_battles,
        gs.weekly_earnings, gs.total_earnings
    `, [guildId]);

    if (stats.rows.length === 0) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching guild stats:', error);
    res.status(500).json({ error: 'Failed to fetch guild stats' });
  }
});

// Add this new endpoint to the existing guilds.ts router
router.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT 
        g.id,
        g.name,
        g.mascot_image,
        COALESCE(gs.weekly_pvp_wins + gs.weekly_pve_wins, 0) as weekly_wins,
        COALESCE(gs.weekly_pvp_battles + gs.weekly_pve_battles, 0) as weekly_battles,
        COALESCE(gs.weekly_pvp_wins, 0) as pvp_wins,
        COALESCE(gs.weekly_pvp_battles, 0) as pvp_battles,
        COALESCE(gs.weekly_earnings, 0) as weekly_earnings,
        COUNT(gm.wallet_address) as member_count,
        CASE 
          WHEN (gs.weekly_pvp_battles + gs.weekly_pve_battles) = 0 THEN 0
          ELSE ROUND(((gs.weekly_pvp_wins + gs.weekly_pve_wins)::float / 
                    (gs.weekly_pvp_battles + gs.weekly_pve_battles)) * 100)
        END as win_rate,
        CASE 
          WHEN gs.weekly_pvp_battles = 0 THEN 0
          ELSE ROUND((gs.weekly_pvp_wins::float / gs.weekly_pvp_battles) * 100)
        END as pvp_win_rate,
        gs.guild_points
      FROM guilds g
      LEFT JOIN guild_stats gs ON g.id = gs.guild_id
      LEFT JOIN guild_members gm ON g.id = gm.guild_id
      GROUP BY 
        g.id, g.name, g.mascot_image,
        gs.weekly_pvp_wins, gs.weekly_pve_wins,
        gs.weekly_pvp_battles, gs.weekly_pve_battles,
        gs.weekly_earnings, gs.guild_points
      ORDER BY 
        gs.guild_points DESC,
        gs.weekly_earnings DESC
    `);

    // Calculate total prize pool (sum of all guild treasuries)
    const prizePool = await db.query(`
      SELECT SUM(treasury) as total_prize_pool
      FROM guilds
    `);

    res.json({
      guilds: result.rows.map(guild => ({
        name: guild.name,
        points: guild.guild_points,
        memberCount: guild.member_count,
        winRate: guild.win_rate,
        pvpWinRate: guild.pvp_win_rate,
        totalBattles: guild.weekly_battles,
        pvpBattles: guild.pvp_battles,
        mascotImage: guild.mascot_image
      })),
      prizePool: Number(prizePool.rows[0].total_prize_pool || 0) / 1e9
    });
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

export default router;