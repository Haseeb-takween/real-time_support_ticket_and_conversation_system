"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ user: AuthUser }>("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await apiFetch<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user } = await apiFetch<{ user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export { ApiError };
