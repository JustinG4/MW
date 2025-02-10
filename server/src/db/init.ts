// server/src/db/init.ts
import pg from 'pg';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEBUG = true; // Enable debug logging

function log(...args: any[]) {
  if (DEBUG) {
    console.log('[DB Init]', ...args);
  }
}

async function initializeDatabase() {
  const { Pool } = pg;
  log('Creating database pool...');
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432')
  });

  try {
    log('Testing connection...');
    await pool.query('SELECT NOW()');
    log('Database connected!');

    log('Reading schema file...');
    const schemaPath = join(__dirname, 'schema.sql');
    log('Schema path:', schemaPath);
    const schema = await readFile(schemaPath, 'utf8');
    log('Schema file read successfully');

    // Drop tables
    log('Dropping existing tables...');
    await pool.query('DROP TABLE IF EXISTS guild_members CASCADE;');
    await pool.query('DROP TABLE IF EXISTS guild_monsters CASCADE;');
    await pool.query('DROP TABLE IF EXISTS guild_stats CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    await pool.query('DROP TABLE IF EXISTS guilds CASCADE;');
    log('✅ All tables dropped');

    // Create tables one by one
    log('Creating guilds table...');
    await pool.query(`
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
    `);
    log('✅ Guilds table created');

    log('Creating users table...');
    await pool.query(`
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
    `);
    log('✅ Users table created');

    log('Creating guild_members table...');
    await pool.query(`
      CREATE TABLE guild_members (
        guild_id VARCHAR(50) REFERENCES guilds(id),
        wallet_address VARCHAR(42) REFERENCES users(wallet_address),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, wallet_address)
      );
    `);
    log('✅ Guild members table created');

    log('Creating guild_stats table...');
    await pool.query(`
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
    `);
    log('✅ Guild stats table created');

    log('Creating guild_monsters table...');
    await pool.query(`
      CREATE TABLE guild_monsters (
        guild_id VARCHAR(50) REFERENCES guilds(id),
        name VARCHAR(100) NOT NULL,
        base_health INT NOT NULL,
        base_attack INT NOT NULL,
        base_defense INT NOT NULL,
        base_speed INT NOT NULL,
        PRIMARY KEY (guild_id)
      );
    `);
    log('✅ Guild monsters table created');

    // Insert initial data
    log('Inserting initial data...');
    await pool.query(`
      INSERT INTO guilds (id, name, description, memecoin, entry_fee, established, mascot_image) 
      VALUES 
        ('DOGE', 'DOGE Legion', 'Much wow, very battle', 'DOGE', 100, '2021-01-01', './img/doggomon.png'),
        ('PEPE', 'PEPE Force', 'Rare fighters only', 'PEPE', 100, '2022-01-01', './img/pepemon.png');

      INSERT INTO guild_monsters (guild_id, name, base_health, base_attack, base_defense, base_speed)
      VALUES 
        ('DOGE', 'Doggomon', 100, 15, 10, 12),
        ('PEPE', 'Pepemon', 90, 18, 8, 14);

      INSERT INTO guild_stats (guild_id)
      VALUES ('DOGE'), ('PEPE');
    `);
    log('✅ Initial data inserted');

    // Verify tables
    log('Verifying tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    log('Created tables:', tables.rows.map(r => r.table_name));

    // Verify users table specifically
    log('Verifying users table structure...');
    const usersStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    log('Users table columns:', usersStructure.rows);

    log('✅ Database initialization completed successfully!');
    return true;
  } catch (err) {
    log('❌ Error during initialization:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (process.argv[1] === import.meta.url) {
  console.log('Starting database initialization...');
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}

export { initializeDatabase };