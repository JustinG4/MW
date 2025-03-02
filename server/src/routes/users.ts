import express, { Request, Response, Router } from 'express';
import { db } from '../db/index.js';


const router: Router = express.Router();

interface CreateUserRequest {
  walletAddress: string;
  username: string;
}

// Create or update user
router.post(
  '/',
  async (
    req: Request<{}, any, CreateUserRequest>,
    res: Response
  ) => {
    const { walletAddress, username } = req.body;

    if (!walletAddress || !username) {
      return res.status(400).json({ error: 'Wallet address and username are required' });
    }

    try {
      // First check if user already exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE wallet_address = $1',
        [walletAddress]
      );

      if (existingUser.rows[0]) {
        // Update existing user's username and last login
        const result = await db.query(`
          UPDATE users 
          SET username = $1, last_login = CURRENT_TIMESTAMP
          WHERE wallet_address = $2
          RETURNING *
        `, [username, walletAddress]);

        return res.json({ 
          success: true, 
          user: result.rows[0],
          isNewUser: false 
        });
      }

      // Create new user
      const result = await db.query(`
        INSERT INTO users (wallet_address, username)
        VALUES ($1, $2)
        RETURNING *
      `, [walletAddress, username]);

      res.json({ 
        success: true, 
        user: result.rows[0],
        isNewUser: true 
      });
    } catch (err) {
      console.error('Failed to create/update user:', err);
      res.status(500).json({ error: 'Failed to create/update user' });
    }
  }
);

// Get user profile
router.get('/:walletAddress', async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  
  try {
    const result = await db.query(`
      SELECT 
        u.*,
        g.name as guild_name,
        g.treasury as guild_treasury
      FROM users u
      LEFT JOIN guilds g ON u.current_guild = g.id
      WHERE u.wallet_address = $1
    `, [walletAddress]);

    if (result.rows[0]) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Failed to fetch user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user stats
router.post('/:walletAddress/stats', async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const { won, earnings, xp, isPvP } = req.body;
  
  try {
    await db.transaction(async (client) => {
      // Update user stats
      const statsResult = await client.query(`
        INSERT INTO user_stats (
          wallet_address,
          pvp_wins,
          pvp_losses,
          pve_wins,
          pve_losses,
          total_earnings,
          weekly_earnings,
          weekly_pvp_wins,
          weekly_pve_wins
        ) 
        VALUES ($1, 0, 0, 0, 0, 0, 0, 0, 0)
        ON CONFLICT (wallet_address) DO UPDATE
        SET 
          pvp_wins = user_stats.pvp_wins + $2,
          pvp_losses = user_stats.pvp_losses + $3,
          pve_wins = user_stats.pve_wins + $4,
          pve_losses = user_stats.pve_losses + $5,
          total_earnings = user_stats.total_earnings + $6,
          weekly_earnings = user_stats.weekly_earnings + $6,
          weekly_pvp_wins = user_stats.weekly_pvp_wins + $7,
          weekly_pve_wins = user_stats.weekly_pve_wins + $8
        WHERE user_stats.wallet_address = $1
        RETURNING *
      `, [
        walletAddress,
        isPvP && won ? 1 : 0,
        isPvP && !won ? 1 : 0,
        !isPvP && won ? 1 : 0,
        !isPvP && !won ? 1 : 0,
        earnings || 0,
        isPvP && won ? 1 : 0,
        !isPvP && won ? 1 : 0
      ]);

      // Update user experience
      const userResult = await client.query(`
        UPDATE users
        SET experience = experience + $1
        WHERE wallet_address = $2
        RETURNING *
      `, [xp || 0, walletAddress]);

      // Check for level up
      if (userResult.rows[0]) {
        const user = userResult.rows[0];
        const newLevel = Math.floor(user.experience / 100) + 1;
        
        if (newLevel > user.level) {
          await client.query(`
            UPDATE users
            SET level = $1
            WHERE wallet_address = $2
          `, [newLevel, walletAddress]);
        }
      }
    });

    const updatedUser = await db.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress]
    );
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error('Failed to update stats:', err);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

// Update user's current guild
router.post('/:walletAddress/guild', async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const { guildId } = req.body;
  
  try {
    // First check if guild exists
    const guildExists = await db.query(
      'SELECT id FROM guilds WHERE id = $1',
      [guildId]
    );

    if (!guildExists.rows[0]) {
      return res.status(404).json({ 
        success: false, 
        error: 'Guild not found' 
      });
    }

    // Update user's current guild
    const result = await db.query(`
      UPDATE users 
      SET current_guild = $1 
      WHERE wallet_address = $2
      RETURNING *
    `, [guildId, walletAddress]);

    if (!result.rows[0]) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('Failed to update user guild:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user guild' 
    });
  }
});

export default router; 