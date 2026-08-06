import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { fetchCurrentUser } from "@/services/auth";
import { clearAuthSession, readAuthSession, subscribeAuthSession, writeAuthSession } from "@/lib/storage";
import type { AuthSession, AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: AuthSession) => void;
  updateTokens: (tokens: Pick<AuthSession, "accessToken" | "refreshToken">) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSessionState] = useState<AuthSession | null>(() => readAuthSession());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(session));

  useEffect(() => {
    const unsubscribe = subscribeAuthSession(() => {
      setSessionState(readAuthSession());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      if (!session) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const user = await fetchCurrentUser();
        if (cancelled) {
          return;
        }

        const nextSession = {
          ...session,
          user,
        };
        setSessionState(nextSession);
        writeAuthSession(nextSession);
      } catch {
        if (!cancelled) {
          clearAuthSession();
          setSessionState(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      refreshToken: session?.refreshToken ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isLoading,
      setSession: (nextSession) => {
        setSessionState(nextSession);
        writeAuthSession(nextSession);
      },
      updateTokens: (tokens) => {
        if (!session) {
          return;
        }

        const nextSession = {
          ...session,
          ...tokens,
        };
        setSessionState(nextSession);
        writeAuthSession(nextSession);
      },
      clearSession: () => {
        setSessionState(null);
        clearAuthSession();
      },
    }),
    [isLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
