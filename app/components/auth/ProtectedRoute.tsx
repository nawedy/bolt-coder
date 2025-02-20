import React from 'react';
import { useAuth } from '~/lib/auth/AuthContext';
import { LoginPage } from './LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
