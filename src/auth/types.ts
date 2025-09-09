export interface AuthUser {
  address: string;
  publicKey: string;
  walletName?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  user: AuthUser;
}

export interface AuthState {
  isAuthenticated: boolean;
  isConnecting: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  error: string | null;
}

export interface SignInPayload {
  message: string;
  nonce: string;
  signature: string;
  publicKey: string;
  address: string;
  walletName?: string;
}

export interface AuthConfig {
  apiEndpoint?: string;
  storageKeys?: {
    session: string;
    user: string;
  };
  sessionDuration?: number; // in milliseconds
  autoReconnect?: boolean;
}

export interface AuthCallbacks {
  onSignIn?: (user: AuthUser) => void;
  onSignOut?: () => void;
  onError?: (error: string) => void;
  onSessionExpired?: () => void;
}

export interface AuthContextValue extends AuthState {
  signIn: (walletName: string) => Promise<void>;
  signOut: () => void;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}