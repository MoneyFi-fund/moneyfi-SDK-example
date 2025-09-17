import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import type {
  AuthState,
  AuthContextValue,
  AuthUser,
  AuthSession,
} from "@/auth/types";
import { formatAddress, isSessionExpiring, safeJsonParse } from "@/auth/utils";

// Action types for reducer
type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONNECTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "SET_AUTH_SUCCESS";
      payload: { user: AuthUser; session: AuthSession };
    }
  | { type: "CLEAR_AUTH" };

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isConnecting: false,
  isLoading: false,
  user: null,
  session: null,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_CONNECTING":
      return { ...state, isConnecting: action.payload, error: null };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isConnecting: false,
        isLoading: false,
      };
    case "SET_AUTH_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        isConnecting: false,
        isLoading: false,
        user: action.payload.user,
        session: action.payload.session,
        error: null,
      };
    case "CLEAR_AUTH":
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

// Storage utilities
class AuthStorage {
  private static SESSION_KEY = "moneyfi_auth_session";
  private static USER_KEY = "moneyfi_auth_user";

  static saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.warn("Failed to save session to localStorage:", error);
    }
  }

  static getSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session = safeJsonParse<AuthSession | null>(sessionData, null);
      if (!session) return null;

      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  static saveUser(user: AuthUser): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn("Failed to save user to localStorage:", error);
    }
  }

  static getUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (!userData) return null;
      return safeJsonParse<AuthUser | null>(userData, null);
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.warn("Failed to clear session from localStorage:", error);
    }
  }
}

// Create context
const AuthContext = createContext<AuthContextValue | null>(null);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { connect, disconnect, account, connected, wallet } = useWallet();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      dispatch({ type: "SET_LOADING", payload: true });

      const savedSession = AuthStorage.getSession();
      const savedUser = AuthStorage.getUser();

      if (savedSession && savedUser && connected && account) {
        // Check if session is about to expire
        if (isSessionExpiring(new Date(savedSession.expiresAt))) {
          // Session is expiring soon, clear it
          AuthStorage.clearSession();
          dispatch({ type: "CLEAR_AUTH" });
        } else {
          // Restore session
          dispatch({
            type: "SET_AUTH_SUCCESS",
            payload: { user: savedUser, session: savedSession },
          });
        }
      }

      dispatch({ type: "SET_LOADING", payload: false });
    };

    initializeAuth();
  }, [connected, account]);

  // Monitor wallet connection changes
  useEffect(() => {
    if (connected && account && wallet) {
      // Wallet is connected, create user session automatically
      const user: AuthUser = {
        address: formatAddress(account.address.toString()),
        publicKey: account.publicKey?.toString() || "",
        walletName: wallet.name,
      };

      // Create session with 24-hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const session: AuthSession = {
        accessToken: `wallet_token_${Date.now()}`,
        expiresAt,
        user,
      };

      // Save to storage
      AuthStorage.saveSession(session);
      AuthStorage.saveUser(user);

      // Update state
      dispatch({
        type: "SET_AUTH_SUCCESS",
        payload: { user, session },
      });


    } else if (!connected) {
      // Wallet disconnected, clear auth state
      AuthStorage.clearSession();
      dispatch({ type: "CLEAR_AUTH" });
    }
  }, [connected, account, wallet]);

  // Connect to specific wallet - this will open the wallet popup
  const signIn = useCallback(
    async (walletName: string) => {
      try {
        dispatch({ type: "SET_CONNECTING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });


        // This will open the wallet popup directly
        await connect(walletName);

        // The useEffect above will handle the success case when wallet connects
      } catch (error) {
        console.error("Wallet connection failed:", error);
        dispatch({
          type: "SET_ERROR",
          payload:
            error instanceof Error ? error.message : "Failed to connect wallet",
        });
      } finally {
        dispatch({ type: "SET_CONNECTING", payload: false });
      }
    },
    [connect]
  );

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Disconnect wallet
      await disconnect();

      // Clear storage
      AuthStorage.clearSession();

      // Update state (will also be handled by useEffect above)
      dispatch({ type: "CLEAR_AUTH" });
    } catch (error) {
      console.error("Sign out failed:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Sign out failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [disconnect]);

  // Refresh session function
  const refreshSession = useCallback(async () => {
    if (state.session && state.user) {
      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + 24);

      const updatedSession: AuthSession = {
        ...state.session,
        expiresAt: newExpiresAt,
      };

      AuthStorage.saveSession(updatedSession);
      dispatch({
        type: "SET_AUTH_SUCCESS",
        payload: { user: state.user, session: updatedSession },
      });
    }
  }, [state.session, state.user]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  // Monitor session expiration
  useEffect(() => {
    if (!state.session) return;

    const checkSessionExpiration = () => {
      if (isSessionExpiring(new Date(state.session!.expiresAt))) {
        signOut();
      }
    };

    const interval = setInterval(checkSessionExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.session, signOut]);

  const contextValue: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    refreshSession,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
