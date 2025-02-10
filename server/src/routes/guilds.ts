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
             gm.base_health, gm.base_attack, gm.base_defense, gm.base_speed
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
router.post(
  '/:guildId/battles',
  async (
    req: Request<GuildParams, any, BattleRequest>,
    res: Response
  ) => {
    const { guildId } = req.params;
    const { won, earnings } = req.body;

    try {
      await db.query('BEGIN');

      // Update stats
      await db.query(`
        UPDATE guild_stats 
        SET weekly_battles = weekly_battles + 1,
            total_battles = total_battles + 1,
            weekly_wins = weekly_wins + $1,
            total_wins = total_wins + $1,
            weekly_earnings = weekly_earnings + $2,
            total_earnings = total_earnings + $2
        WHERE guild_id = $3
      `, [won ? 1 : 0, earnings, guildId]);

      // Update treasury
      if (earnings > 0) {
        await db.query(`
          UPDATE guilds 
          SET treasury = treasury + $1
          WHERE id = $2
        `, [earnings, guildId]);
      }

      await db.query('COMMIT');
      res.json({ success: true });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error('Failed to record battle:', err);
      res.status(500).json({ error: 'Failed to record battle' });
    }
  }
);

export default router;