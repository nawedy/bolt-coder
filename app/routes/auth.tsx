import { json, redirect } from '@remix-run/node';
import { LoginForm } from '~/components/auth/LoginForm';
import { createUserSession } from '~/lib/auth/session.server';
import { ENV } from '~/lib/config.server';

export async function action({ request }) {
  console.log('Environment variables:', {
    adminUsername: ENV.ADMIN_USERNAME,
    adminPasswordLength: ENV.ADMIN_PASSWORD?.length,
  });
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  console.log('Login attempt:', { username, providedPasswordLength: password?.length });

  if (!username || !password) {
    return json({ error: 'Username and password are required' }, { status: 400 });
  }

  try {
    const isValidUsername = username === ENV.ADMIN_USERNAME;
    const isValidPassword = password === ENV.ADMIN_PASSWORD;

    console.log('Validation:', { isValidUsername, isValidPassword });
    // Skip the login helper and create session directly if credentials match
    if (isValidUsername && isValidPassword) {
      console.log('Creating session for user');
      const user = {
        id: 'admin-id',
        username: ENV.ADMIN_USERNAME,
        isAdmin: true,
        apiKeys: {}
      };
      return createUserSession(user.id, '/');
    }

    console.log('Login validation failed');
    return json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Login failed' }, { status: 500 });
  }
}

export default function LoginRoute() {
  return <LoginForm />;
}
