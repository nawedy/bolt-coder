/**
 * Server-side configuration module that loads environment variables
 */

import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

export const ENV = {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  AUTH_DB_PATH: process.env.AUTH_DB_PATH,
  SESSION_SECRET: process.env.SESSION_SECRET || 'default-session-secret',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

// Validate required environment variables
const requiredVars = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ENCRYPTION_KEY'] as const;

for (const key of requiredVars) {
  if (!ENV[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
