"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { SheetsAuthUser } from "./types";
import {
  sheetsSignIn,
  sheetsSignOut,
  getAccessToken,
  getStoredSheetsUser,
} from "./googleAuth";

// Tracks the dashboard's own Google Sheets/Drive connection — separate from
// the site-wide next-auth session that already gated access to /dashboard
// (see src/auth.ts). That login only ever asks for basic profile/email;
// this one is requested on demand, only when "Link Google Sheet" is used.
interface SheetsAuthContextType {
  user: SheetsAuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
}

const SheetsAuthContext = createContext<SheetsAuthContextType | undefined>(undefined);

export function SheetsAuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializers instead of an effect-driven hydration: the access
  // token lives in a plain module variable that's guaranteed null on every
  // fresh page load (it resets whenever the JS module re-evaluates), so
  // this never disagrees with the server-rendered "signed out" markup —
  // it only actually restores something on a client-side remount within
  // the same session, which has no SSR output to mismatch against.
  const [user, setUser] = useState<SheetsAuthUser | null>(() => (getAccessToken() ? getStoredSheetsUser() : null));
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken);
  const [isLoading, setIsLoading] = useState(false);

  const connect = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await sheetsSignIn();
      setUser(result.user);
      setAccessTokenState(result.accessToken);
      return true;
    } catch (error) {
      console.error("Google Sheets connect failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await sheetsSignOut();
      setUser(null);
      setAccessTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, accessToken, isLoading, connect, disconnect }),
    [user, accessToken, isLoading, connect, disconnect]
  );

  return <SheetsAuthContext.Provider value={value}>{children}</SheetsAuthContext.Provider>;
}

export function useSheetsAuth(): SheetsAuthContextType {
  const context = useContext(SheetsAuthContext);
  if (!context) {
    throw new Error("useSheetsAuth must be used within a SheetsAuthProvider");
  }
  return context;
}
