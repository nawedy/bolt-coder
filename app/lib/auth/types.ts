// Internal user type with password
export interface InternalUser {
  id: string;
  username: string;
  isAdmin: boolean;
  password: string;
}

// Public user type without password
export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  apiKeys: {
    [provider: string]: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export type AuthContextType = {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateApiKey: (provider: string, key: string) => void;
};
