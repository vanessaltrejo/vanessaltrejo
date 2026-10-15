import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AuthContextType, AuthUser } from '../types/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  getStoredUser,
  setAccessToken as setCachedAccessToken,
} from '../services/googleAuthService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);

  useEffect(() => {
    // Check if there is an existing session user
    const storedUser = getStoredUser();
    const token = getAccessToken();
    if (storedUser && token) {
      setUser(storedUser);
      setAccessToken(token);
      setNeedsAuth(false);
    }
  }, []);

  const handleSignIn = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google Sign-in failed in AuthProvider:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setNeedsAuth(true);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      needsAuth,
      signIn: handleSignIn,
      signOut: handleSignOut,
    }),
    [user, accessToken, isLoading, needsAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
