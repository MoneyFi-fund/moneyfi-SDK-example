import { useContext } from 'react';
import { AuthContextValue } from './types';
import { AuthProvider } from './AuthProvider';

// Re-export the useAuth hook from AuthProvider for convenience
export { useAuth } from './AuthProvider';

// Additional hooks for specific auth operations
export const useAuthUser = () => {
  const { user, isAuthenticated } = useAuth();
  return { user: isAuthenticated ? user : null, isAuthenticated };
};

export const useAuthSession = () => {
  const { session, isAuthenticated } = useAuth();
  return { session: isAuthenticated ? session : null, isAuthenticated };
};

export const useAuthStatus = () => {
  const { isAuthenticated, isConnecting, isLoading, error } = useAuth();
  return { isAuthenticated, isConnecting, isLoading, error };
};

// Hook for auth actions
export const useAuthActions = () => {
  const { signIn, signOut, refreshSession, clearError } = useAuth();
  return { signIn, signOut, refreshSession, clearError };
};