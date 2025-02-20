import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { auth } from '~/lib/auth/db';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = auth.verifyUser(username, password);
    
    if (!user) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
};
