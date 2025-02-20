import { createCookieSessionStorage, redirect } from '@remix-run/node';
import bcrypt from 'bcryptjs';
import type { LoginCredentials, User } from './types';
import { ENV } from '~/lib/config.server';

// Initialize session storage
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_bolt_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [ENV.SESSION_SECRET],
    secure: ENV.NODE_ENV === 'production',
  },
});

// Get session from request
export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

// Create user session
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set('userId', userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

// Get logged-in user
export async function getUser(request: Request): Promise<User | null> {
  const session = await getSession(request);
  const userId = session.get('userId');
  
  if (!userId) return null;

  try {
    // Here we would typically query the database
    // For now, we'll return a mock user if the ID matches
    if (userId === 'admin-id') {
      return {
        id: 'admin-id',
        username: ENV.ADMIN_USERNAME,
        isAdmin: true,
        apiKeys: {},
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Login user
export async function login({ username, password }: LoginCredentials): Promise<User | null> {
  // Verify against environment variables for admin
  if (
    username === ENV.ADMIN_USERNAME &&
    password === ENV.ADMIN_PASSWORD
  ) {
    return {
      id: 'admin-id',
      username,
      isAdmin: true,
      apiKeys: {},
    };
  }
  return null;
}

// Logout user
export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
