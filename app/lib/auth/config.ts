export const AUTH_CONFIG = {
  // Minimum 32 characters for AES-256
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-min-32-chars!!',

  // Default admin credentials - should be changed after first login
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123!#Secure',

  // Database configuration
  DB_PATH: process.env.AUTH_DB_PATH || 'auth.db',

  // Password requirements
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: true,
};
