import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import { type User, type InternalUser } from './types';
import { AUTH_CONFIG } from './config';
import { validatePassword } from './validation';

// Use encryption key from config
const ENCRYPTION_KEY = AUTH_CONFIG.ENCRYPTION_KEY;

// Create default admin
const adminId = 'admin-' + Buffer.from(AUTH_CONFIG.ADMIN_USERNAME).toString('hex');
const hashedPassword = bcrypt.hashSync(AUTH_CONFIG.ADMIN_PASSWORD, 10);

// In-memory user store
const users = new Map<string, InternalUser>();

// Initialize with default admin
users.set(adminId, {
  id: adminId,
  username: AUTH_CONFIG.ADMIN_USERNAME,
  isAdmin: true,
  password: hashedPassword,
} as InternalUser);

// In-memory API key store
const apiKeys = new Map<string, Map<string, string>>();

// Helper functions
function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
}

function decryptApiKey(encryptedApiKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedApiKey, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Database operations
export const auth = {
  verifyUser(username: string, password: string): User | null {
    // Find user by username
    const user = Array.from(users.values()).find((u) => u.username === username);

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
    const userApiKeys = apiKeys.get(user.id);
    const decryptedApiKeys: { [provider: string]: string } = {};

    if (userApiKeys) {
      userApiKeys.forEach((encryptedKey, provider) => {
        decryptedApiKeys[provider] = decryptApiKey(encryptedKey);
      });
    }

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      apiKeys: decryptedApiKeys,
    };
  },

  // Update API key
  updateApiKey(userId: string, provider: string, apiKey: string): void {
    const encryptedKey = encryptApiKey(apiKey);

    if (!apiKeys.has(userId)) {
      apiKeys.set(userId, new Map());
    }

    apiKeys.get(userId)?.set(provider, encryptedKey);
  },

  // Change password
  changePassword(userId: string, newPassword: string): { success: boolean; error?: string } {
    const validation = validatePassword(newPassword);

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const user = users.get(userId);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    users.set(userId, { ...user, password: hashedPassword });

    return { success: true };
  },

  // Create new user (admin only)
  createUser(username: string, password: string, isAdmin: boolean = false): { user?: User; error?: string } {
    const validation = validatePassword(password);

    if (!validation.isValid) {
      return { error: validation.error };
    }

    // Check if username already exists
    if (Array.from(users.values()).some((u) => u.username === username)) {
      return { error: 'Username already exists' };
    }

    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const userId = 'user-' + Buffer.from(username).toString('hex');

      const user: InternalUser = {
        id: userId,
        username,
        isAdmin,
        password: hashedPassword,
      };

      users.set(userId, user);

      return {
        user: {
          id: userId,
          username,
          isAdmin,
          apiKeys: {},
        },
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { error: 'Failed to create user. Please try again.' };
    }
  },
};
