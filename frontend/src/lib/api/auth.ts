import { handleResponse } from './utils';

const API_URL = process.env.API_URL;

export async function login(username: string, password: string): Promise<{ access_token: string }> {
  const response = await fetch(`${API_URL}/api/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }),
  }).then(handleResponse);

  return response.json();
}
