import { db } from './index';

async function testConnection() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Database connected successfully at:', result.rows[0].now);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

testConnection(); 