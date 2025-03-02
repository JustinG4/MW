-- server/src/db/schema.sql
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS battle_moves CASCADE;
DROP TABLE IF EXISTS battles CASCADE;
DROP TABLE IF EXISTS guild_members CASCADE;
DROP TABLE IF EXISTS guild_monsters CASCADE;
DROP TABLE IF EXISTS guild_stats CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS guilds CASCADE;

-- Create guilds first (as it's referenced by other tables)
CREATE TABLE guilds (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  memecoin VARCHAR(50) NOT NULL,
  entry_fee BIGINT NOT NULL,
  treasury BIGINT DEFAULT 0,
  established DATE NOT NULL,
  mascot_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Then create users (which references guilds)
CREATE TABLE users (
  wallet_address VARCHAR(42) PRIMARY KEY,
  username VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  current_guild VARCHAR(50) REFERENCES guilds(id),
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  rank VARCHAR(20) DEFAULT 'Novice'
);

-- Separate user stats table for better organization and querying
CREATE TABLE user_stats (
  wallet_address VARCHAR(42) REFERENCES users(wallet_address) PRIMARY KEY,
  pvp_wins INT DEFAULT 0,
  pvp_losses INT DEFAULT 0,
  pve_wins INT DEFAULT 0,
  pve_losses INT DEFAULT 0,
  total_earnings BIGINT DEFAULT 0,
  weekly_earnings BIGINT DEFAULT 0,
  weekly_pvp_wins INT DEFAULT 0,
  weekly_pve_wins INT DEFAULT 0,
  last_weekly_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guild members table
CREATE TABLE guild_members (
  guild_id VARCHAR(50) REFERENCES guilds(id),
  wallet_address VARCHAR(42) REFERENCES users(wallet_address),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  contribution_points INT DEFAULT 0,
  PRIMARY KEY (guild_id, wallet_address)
);

-- Enhanced guild stats with separate PVP and PVE tracking
CREATE TABLE guild_stats (
  guild_id VARCHAR(50) REFERENCES guilds(id) PRIMARY KEY,
  weekly_pvp_wins INT DEFAULT 0,
  weekly_pve_wins INT DEFAULT 0,
  weekly_pvp_battles INT DEFAULT 0,
  weekly_pve_battles INT DEFAULT 0,
  total_pvp_wins INT DEFAULT 0,
  total_pve_wins INT DEFAULT 0,
  total_pvp_battles INT DEFAULT 0,
  total_pve_battles INT DEFAULT 0,
  weekly_earnings BIGINT DEFAULT 0,
  total_earnings BIGINT DEFAULT 0,
  guild_points INT DEFAULT 0,
  last_weekly_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced guild monsters with special moves and levels
CREATE TABLE guild_monsters (
  guild_id VARCHAR(50) REFERENCES guilds(id),
  monster_id SERIAL,
  name VARCHAR(100) NOT NULL,
  base_health INT NOT NULL,
  base_attack INT NOT NULL,
  base_defense INT NOT NULL,
  base_speed INT NOT NULL,
  special_move VARCHAR(100),
  special_move_damage INT,
  special_move_effect TEXT,
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  PRIMARY KEY (guild_id, monster_id)
);

-- New table for battle history
CREATE TABLE battles (
  battle_id SERIAL PRIMARY KEY,
  game_mode VARCHAR(10) NOT NULL CHECK (game_mode IN ('PVP', 'PVE')),
  winner_address VARCHAR(42) REFERENCES users(wallet_address),
  loser_address VARCHAR(42) REFERENCES users(wallet_address),
  winner_guild VARCHAR(50) REFERENCES guilds(id),
  loser_guild VARCHAR(50) REFERENCES guilds(id),
  total_rounds INT NOT NULL,
  winner_final_health INT NOT NULL,
  earnings BIGINT DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New table for battle moves
CREATE TABLE battle_moves (
  battle_id INT REFERENCES battles(battle_id),
  round_number INT NOT NULL,
  move_sequence INT NOT NULL,
  player1_move VARCHAR(100) NOT NULL,
  player2_move VARCHAR(100) NOT NULL,
  player1_damage INT NOT NULL,
  player2_damage INT NOT NULL,
  player1_health INT NOT NULL,
  player2_health INT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (battle_id, round_number, move_sequence)
);

-- Insert initial data
INSERT INTO guilds (id, name, description, memecoin, entry_fee, established, mascot_image) 
VALUES 
  ('DOGE', 'DOGE Legion', 'Much wow, very battle', 'DOGE', 100, '2021-01-01', './img/doggomon.png'),
  ('PEPE', 'PEPE Force', 'Rare fighters only', 'PEPE', 100, '2022-01-01', './img/pepemon.png');

-- Insert initial monsters with special moves
INSERT INTO guild_monsters (guild_id, name, base_health, base_attack, base_defense, base_speed, special_move, special_move_damage, special_move_effect)
VALUES 
  ('DOGE', 'Doggomon', 100, 15, 10, 12, 'Much Blast', 25, 'Has a chance to stun the opponent'),
  ('PEPE', 'Pepemon', 90, 18, 8, 14, 'Rare Slash', 30, 'Increases attack power for next turn');

-- Initialize stats
INSERT INTO guild_stats (guild_id)
VALUES ('DOGE'), ('PEPE');