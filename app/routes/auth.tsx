import { json, redirect } from '@remix-run/node';
import { LoginForm } from '~/components/auth/LoginForm';
import { createUserSession, getSession } from '~/lib/auth/session.server';
import { auth } from '~/lib/auth/db';

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  if (typeof username !== 'string' || typeof password !== 'string') {
    return json({ error: 'Username and password are required' }, { status: 400 });
  }

  try {
    const user = auth.verifyUser(username, password);

    if (!user) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return createUserSession(user.id, '/');
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request);

  if (session.has('userId')) {
    return redirect('/');
  }

  return null;
}

export default function LoginRoute() {
  return <LoginForm />;
}
