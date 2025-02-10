// server/src/config/index.ts
import dotenv from 'dotenv';
import { dbConfig } from './database';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: dbConfig
};