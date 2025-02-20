import Database from 'better-sqlite3';
import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import { type User } from './types';
import { AUTH_CONFIG } from './config';
import { validatePassword } from './validation';

// Initialize database
const db = new Database(AUTH_CONFIG.DB_PATH);

// Use encryption key from config
const ENCRYPTION_KEY = AUTH_CONFIG.ENCRYPTION_KEY;

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS apiKeys (
    userId TEXT NOT NULL,
    provider TEXT NOT NULL,
    encryptedKey TEXT NOT NULL,
    PRIMARY KEY (userId, provider),
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

// Create default admin if not exists
const createDefaultAdmin = db.prepare(`
  INSERT OR IGNORE INTO users (id, username, password, isAdmin)
  VALUES (?, ?, ?, 1)
`);

// Use admin credentials from config
const hashedPassword = bcrypt.hashSync(AUTH_CONFIG.ADMIN_PASSWORD, 10);

// Create default admin with a stable ID
const adminId = 'admin-' + Buffer.from(AUTH_CONFIG.ADMIN_USERNAME).toString('hex');
console.log('Creating default admin:', {
  id: adminId,
  username: AUTH_CONFIG.ADMIN_USERNAME,
  passwordLength: AUTH_CONFIG.ADMIN_PASSWORD.length
});
createDefaultAdmin.run(adminId, AUTH_CONFIG.ADMIN_USERNAME, hashedPassword);

// Verify admin was created
const adminCheck = db.prepare('SELECT * FROM users WHERE username = ?').get(AUTH_CONFIG.ADMIN_USERNAME);
console.log('Admin user exists:', adminCheck ? 'yes' : 'no');

// Encrypt API key
function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
}

// Decrypt API key
function decryptApiKey(encryptedApiKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedApiKey, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Database operations
export const auth = {
  // Verify user credentials
  verifyUser: (username: string, password: string): User | null => {
    console.log('Attempting login for username:', username);

    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as any;

    console.log('Found user:', user ? 'yes' : 'no');
    if (!user) {
      console.log('User not found');
      return null;
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    console.log('Password match:', passwordMatch ? 'yes' : 'no');

    if (!passwordMatch) {
      return null;
    }

    // Get user's API keys
    const apiKeysStmt = db.prepare('SELECT provider, encryptedKey FROM apiKeys WHERE userId = ?');
    const apiKeys = apiKeysStmt.all(user.id) as { provider: string; encryptedKey: string }[];

    const decryptedApiKeys: { [provider: string]: string } = {};
    apiKeys.forEach(({ provider, encryptedKey }) => {
      decryptedApiKeys[provider] = decryptApiKey(encryptedKey);
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: Boolean(user.isAdmin),
      apiKeys: decryptedApiKeys,
    };
  },

  // Update API key
  updateApiKey: (userId: string, provider: string, apiKey: string): void => {
    const encryptedKey = encryptApiKey(apiKey);
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO apiKeys (userId, provider, encryptedKey)
      VALUES (?, ?, ?)
    `);
    stmt.run(userId, provider, encryptedKey);
  },

  // Change password
  changePassword: (userId: string, newPassword: string): { success: boolean; error?: string } => {
    const validation = validatePassword(newPassword);

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
    stmt.run(hashedPassword, userId);

    return { success: true };
  },

  // Create new user (admin only)
  createUser: (username: string, password: string, isAdmin: boolean = false): { user?: User; error?: string } => {
    // Validate password
    const validation = validatePassword(password);

    if (!validation.isValid) {
      return { error: validation.error };
    }

    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = db.prepare(`
        INSERT INTO users (id, username, password, isAdmin)
        VALUES (?, ?, ?, ?)
      `);
      const userId = Math.random().toString(36).substring(2);
      stmt.run(userId, username, hashedPassword, isAdmin ? 1 : 0);

      const user = {
        id: userId,
        username,
        isAdmin,
        apiKeys: {},
      };

      return { user };
    } catch (error) {
      console.error('Error creating user:', error);

      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        return { error: 'Username already exists' };
      }

      return { error: 'Failed to create user. Please try again.' };
    }
  },
};
