import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSubmit, useNavigate } from '@remix-run/react';
import type { AuthContextType, AuthState, LoginCredentials } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AuthState['user'];
}) {
  const [authState, setAuthState] = useState<AuthState>({
    user: initialUser,
    isAuthenticated: !!initialUser,
    error: null,
  });

  const submit = useSubmit();
  const navigate = useNavigate();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        submit(formData, { method: 'post', action: '/auth' });
      } catch (error) {
        console.error('Login error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          error: error instanceof Error ? error.message : 'Login failed',
        });
      }
    },
    [submit],
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      setAuthState({
        user: null,
        isAuthenticated: false,
        error: null,
      });
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const updateApiKey = useCallback(async (provider: string, key: string) => {
    try {
      const response = await fetch('/api/auth/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key }),
      });

      if (!response.ok) {
        throw new Error('Failed to update API key');
      }

      const data = (await response.json()) as { user: AuthState['user'] };

      setAuthState((prev) => ({
        ...prev,
        user: data.user,
      }));
    } catch (error) {
      console.error('API key update error:', error);
    }
  }, []);

  const value = {
    authState,
    login,
    logout,
    updateApiKey,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
