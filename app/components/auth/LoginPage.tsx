/**
 * @fileoverview Login page component that handles user authentication
 * Provides a secure interface for users to log in with username and password
 */

import React, { useState } from 'react';
import { useAuth } from '~/lib/auth/AuthContext';
import '~/styles/login.css';

/**
 * LoginPage component that renders a login form with username and password fields
 * Uses the auth context to handle login functionality
 * @returns React component with login form
 */
export function LoginPage(): JSX.Element {
  const { login, authState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Handles form submission by preventing default behavior and calling login
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    setError(null);
    e.preventDefault();

    try {
      await login({ username, password });
      console.log('Login attempt completed');

      if (!authState.isAuthenticated) {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h1 className="login-title">Login</h1>
        {authState.error && <div className="error-message">{authState.error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {(error || authState.error) && <div className="error-message">{error || authState.error}</div>}
          <button type="submit" className="login-button">
            Start Now
          </button>
        </form>
      </div>
    </div>
  );
}
