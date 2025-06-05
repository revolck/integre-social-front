"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  permissions: string[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  permissions: [],
  loading: true,
  refresh: async () => {},
});

async function fetchSessionData() {
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Unauthenticated");
    return (await res.json()) as { user: User | null; permissions: string[] };
  } catch {
    return { user: null, permissions: [] };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    setLoading(true);
    const data = await fetchSessionData();
    setUser(data.user);
    setPermissions(data.permissions);
    setLoading(false);
  };

  useEffect(() => {
    loadSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, permissions, loading, refresh: loadSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
