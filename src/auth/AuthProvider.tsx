import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { type AuthState, type AuthContextValue, type AuthConfig, type AuthCallbacks, type AuthUser, type AuthSession } from './types';
import { AuthStorage } from './storage';
import { createSignMessage, generateNonce, createAuthPayload, isSessionExpiring } from './utils';

// Auth reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: { user: AuthUser; session: AuthSession } }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  isAuthenticated: false,
  isConnecting: false,
  isLoading: false,
  user: null,
  session: null,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isConnecting: false };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        session: action.payload.session,
        error: null,
        isLoading: false,
        isConnecting: false,
      };
    case 'SET_UNAUTHENTICATED':
      return {
        ...initialState,
        isLoading: false,
        isConnecting: false,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
const AuthContext = createContext<AuthContextValue | null>(null);

// Default configuration
const DEFAULT_CONFIG: AuthConfig = {
  storageKeys: {
    session: 'moneyfi_auth_session',
    user: 'moneyfi_auth_user',
  },
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
  autoReconnect: true,
};

interface AuthProviderProps {
  children: React.ReactNode;
  config?: AuthConfig;
  callbacks?: AuthCallbacks;
  onSignIn?: (payload: any) => Promise<AuthSession>;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  config = {}, 
  callbacks = {},
  onSignIn 
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const wallet = useWallet();
  const storage = useRef(new AuthStorage(config.storageKeys));
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Session expiration check interval
  const sessionCheckInterval = useRef<NodeJS.Timeout>();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const savedSession = storage.current.getSession();
        const savedUser = storage.current.getUser();

        if (savedSession && savedUser && storage.current.isSessionValid(savedSession)) {
          dispatch({
            type: 'SET_AUTHENTICATED',
            payload: { user: savedUser, session: savedSession }
          });
          
          callbacks.onSignIn?.(savedUser);
        } else {
          // Clear invalid session
          storage.current.clear();
          dispatch({ type: 'SET_UNAUTHENTICATED' });
        }
      } catch (error) {
        console.warn('Failed to initialize auth:', error);
        storage.current.clear();
        dispatch({ type: 'SET_UNAUTHENTICATED' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Session expiration monitoring
  useEffect(() => {
    if (state.session && state.isAuthenticated) {
      const checkSessionExpiration = () => {
        if (state.session && isSessionExpiring(state.session.expiresAt)) {
          callbacks.onSessionExpired?.();
          signOut();
        }
      };

      sessionCheckInterval.current = setInterval(checkSessionExpiration, 60000); // Check every minute
      
      return () => {
        if (sessionCheckInterval.current) {
          clearInterval(sessionCheckInterval.current);
        }
      };
    }
  }, [state.session, state.isAuthenticated]);

  // Auto-reconnect wallet if session exists but wallet is disconnected
  useEffect(() => {
    if (
      finalConfig.autoReconnect &&
      state.isAuthenticated &&
      state.user &&
      !wallet.connected &&
      !wallet.connecting &&
      !state.isConnecting
    ) {
      const savedWalletName = localStorage.getItem('aptos_wallet_name');
      if (savedWalletName && state.user.walletName === savedWalletName) {
        wallet.connect(savedWalletName);
      }
    }
  }, [state.isAuthenticated, wallet.connected, wallet.connecting, finalConfig.autoReconnect]);

  const signIn = async (walletName: string): Promise<void> => {
    dispatch({ type: 'SET_CONNECTING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Connect to wallet
      if (!wallet.connected) {
        await wallet.connect(walletName);
      }

      if (!wallet.account) {
        throw new Error('Wallet connection failed - no account found');
      }

      dispatch({ type: 'SET_LOADING', payload: true });

      // Generate message and nonce for signing
      const nonce = generateNonce();
      const message = createSignMessage(nonce);

      // Request signature from wallet
      const signResult = await wallet.signMessage({
        message,
        nonce,
      });

      // Create authentication payload
      const authPayload = createAuthPayload({
        message: signResult.fullMessage,
        signature: signResult.signature,
        publicKey: wallet.account.publicKey,
        address: wallet.account.address,
        walletName,
      });

      // Call external sign-in handler (e.g., API call)
      if (!onSignIn) {
        throw new Error('onSignIn handler is required for authentication');
      }

      const session = await onSignIn(authPayload);

      const user: AuthUser = {
        address: wallet.account.address,
        publicKey: wallet.account.publicKey.toString(),
        walletName,
      };

      // Save to storage
      storage.current.saveSession(session);
      storage.current.saveUser(user);
      localStorage.setItem('aptos_wallet_name', walletName);

      // Update state
      dispatch({
        type: 'SET_AUTHENTICATED',
        payload: { user, session }
      });

      callbacks.onSignIn?.(user);

    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      callbacks.onError?.(errorMessage);
      
      // Disconnect wallet on auth failure
      if (wallet.connected) {
        await wallet.disconnect();
      }
    }
  };

  const signOut = (): void => {
    // Clear storage
    storage.current.clear();
    localStorage.removeItem('aptos_wallet_name');
    
    // Clear session check interval
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    // Disconnect wallet
    if (wallet.connected) {
      wallet.disconnect();
    }

    // Update state
    dispatch({ type: 'SET_UNAUTHENTICATED' });
    
    callbacks.onSignOut?.();
  };

  const refreshSession = async (): Promise<void> => {
    if (!state.session || !state.user) {
      throw new Error('No active session to refresh');
    }

    // This would typically make an API call to refresh the session
    // For now, we'll just extend the current session
    const newExpiresAt = new Date(Date.now() + finalConfig.sessionDuration!);
    const updatedSession = {
      ...state.session,
      expiresAt: newExpiresAt,
    };

    storage.current.saveSession(updatedSession);
    dispatch({
      type: 'SET_AUTHENTICATED',
      payload: { user: state.user, session: updatedSession }
    });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    refreshSession,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};