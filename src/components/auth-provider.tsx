"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth-user";

type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  ready: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  avatarSrc: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchSessionUser() {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  const payload = (await response.json().catch(() => null)) as {
    user?: AuthUser | null;
  } | null;
  return payload?.user ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setUser(await fetchSessionUser());
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        isAdmin: Boolean(user?.isAdmin),
        ready,
        login: refresh,
        logout,
        avatarSrc: user?.avatarSrc ?? "",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
