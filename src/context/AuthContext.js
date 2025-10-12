import React, { createContext, useContext, useMemo } from 'react';
import { useAuthState } from '../hooks/useAuthState';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const {
    user,
    loading,
    error: authError,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInWithGithub,
    requestPasswordReset,
    signOut
  } = useAuthState();

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInWithGithub,
    requestPasswordReset,
    signOut,
    // Aliases for backward compatibility
    signInEmailPassword: signIn
  }), [user, loading, authError, signUp, signIn, signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithGithub, requestPasswordReset, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}