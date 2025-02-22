/**
 * Server-side configuration module that loads environment variables
 */

import { config } from 'dotenv';

// Only load .env.local in development
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
}

export const ENV = {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'default-password-needs-change',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'default-key-needs-change',
  AUTH_DB_PATH: process.env.AUTH_DB_PATH,
  SESSION_SECRET: process.env.SESSION_SECRET || 'default-session-secret',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_VERCEL: process.env.VERCEL === '1',
} as const;

// Only validate required vars in production
if (process.env.NODE_ENV === 'production') {
  const requiredVars = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ENCRYPTION_KEY'] as const;

  for (const key of requiredVars) {
    if (ENV[key]?.includes('default-') || !ENV[key]) {
      console.warn(`Warning: Using default value for ${key}. Please set this in your environment variables.`);
    }
  }
}
