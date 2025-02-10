-- server/src/db/schema.sql
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS guild_members CASCADE;
DROP TABLE IF EXISTS guild_monsters CASCADE;
DROP TABLE IF EXISTS guild_stats CASCADE;
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
  battle_wins INT DEFAULT 0,
  battle_losses INT DEFAULT 0,
  total_earnings BIGINT DEFAULT 0,
  current_guild VARCHAR(50) REFERENCES guilds(id),
  level INT DEFAULT 1,
  experience INT DEFAULT 0,
  rank VARCHAR(20) DEFAULT 'Novice'
);

-- Then create dependent tables
CREATE TABLE guild_members (
  guild_id VARCHAR(50) REFERENCES guilds(id),
  wallet_address VARCHAR(42) REFERENCES users(wallet_address),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (guild_id, wallet_address)
);

CREATE TABLE guild_stats (
  guild_id VARCHAR(50) REFERENCES guilds(id),
  weekly_wins INT DEFAULT 0,
  weekly_battles INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_battles INT DEFAULT 0,
  weekly_earnings BIGINT DEFAULT 0,
  total_earnings BIGINT DEFAULT 0,
  last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (guild_id)
);

CREATE TABLE guild_monsters (
  guild_id VARCHAR(50) REFERENCES guilds(id),
  name VARCHAR(100) NOT NULL,
  base_health INT NOT NULL,
  base_attack INT NOT NULL,
  base_defense INT NOT NULL,
  base_speed INT NOT NULL,
  PRIMARY KEY (guild_id)
);

-- Insert initial data
INSERT INTO guilds (id, name, description, memecoin, entry_fee, established, mascot_image) 
VALUES 
  ('DOGE', 'DOGE Legion', 'Much wow, very battle', 'DOGE', 100, '2021-01-01', './img/doggomon.png'),
  ('PEPE', 'PEPE Force', 'Rare fighters only', 'PEPE', 100, '2022-01-01', './img/pepemon.png');

-- Insert initial monsters
INSERT INTO guild_monsters (guild_id, name, base_health, base_attack, base_defense, base_speed)
VALUES 
  ('DOGE', 'Doggomon', 100, 15, 10, 12),
  ('PEPE', 'Pepemon', 90, 18, 8, 14);

-- Initialize stats
INSERT INTO guild_stats (guild_id)
VALUES ('DOGE'), ('PEPE');