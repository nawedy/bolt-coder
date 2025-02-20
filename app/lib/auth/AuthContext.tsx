import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSubmit } from '@remix-run/react';
import type { AuthContextType, AuthState, LoginCredentials } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    error: null,
  });

  const submit = useSubmit();

  const login = useCallback(async (credentials: LoginCredentials) => {
    console.log('Login attempt:', { username: credentials.username });

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
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  }, []);

  const updateApiKey = useCallback(async (provider: string, key: string) => {
    setAuthState((prev) => {
      if (!prev.user) {
        return prev;
      }

      /*
       * Update API key in database
       * Update API key in session
       */
      const formData = new FormData();
      formData.append('provider', provider);
      formData.append('key', key);
      submit(formData, { method: 'post', action: '/api/auth/update-key' });

      return {
        ...prev,
        user: {
          ...prev.user,
          apiKeys: {
            ...prev.user.apiKeys,
            [provider]: key,
          },
        },
      };
    });
  }, []);

  return <AuthContext.Provider value={{ authState, login, logout, updateApiKey }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
