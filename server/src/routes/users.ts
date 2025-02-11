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
  const { won, earnings } = req.body;
  
  try {
    await db.transaction(async (client) => {
      // Update user stats
      const result = await client.query(`
        UPDATE users 
        SET 
          battle_wins = battle_wins + $1,
          battle_losses = battle_losses + $2,
          total_earnings = total_earnings + $3,
          experience = experience + $4
        WHERE wallet_address = $5
        RETURNING *
      `, [
        won ? 1 : 0,
        won ? 0 : 1,
        earnings,
        won ? 100 : 50,
        walletAddress
      ]);

      // Check for level up
      if (result.rows[0].experience >= result.rows[0].level * 100) {
        await client.query(`
          UPDATE users 
          SET 
            level = level + 1,
            experience = 0,
            rank = CASE 
              WHEN level + 1 >= 10 THEN 'Master'
              WHEN level + 1 >= 5 THEN 'Expert'
              ELSE 'Novice'
            END
          WHERE wallet_address = $1
        `, [walletAddress]);
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

export default router; 