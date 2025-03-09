"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient, Session, User } from "./auth-client";

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session) {
          setSession(session);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Failed to initialize session:", error);
        setSession(null);
        setStatus("unauthenticated");
      }
    };

    initSession();
  }, []);

  // Set up session refresh interval
  useEffect(() => {
    if (!session) return;

    const refreshInterval = setInterval(async () => {
      await refreshSession();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [session]);

  const login = async (email: string, password: string) => {
    setStatus("loading");
    try {
      const newSession = await authClient.login(email, password);
      setSession(newSession);
      setStatus("authenticated");
    } catch (error) {
      console.error("Login failed:", error);
      setStatus("unauthenticated");
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setStatus("loading");
    try {
      const newSession = await authClient.register(email, password, name);
      setSession(newSession);
      setStatus("authenticated");
    } catch (error) {
      console.error("Registration failed:", error);
      setStatus("unauthenticated");
      throw error;
    }
  };

  const logout = async () => {
    setStatus("loading");
    try {
      await authClient.logout();
      setSession(null);
      setStatus("unauthenticated");
    } catch (error) {
      console.error("Logout failed:", error);
      setStatus("unauthenticated");
    }
  };

  const refreshSession = async () => {
    try {
      const newSession = await authClient.getSession();
      if (newSession) {
        setSession(newSession);
        setStatus("authenticated");
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
      setSession(null);
      setStatus("unauthenticated");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        status,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useSession() {
  const { session, status } = useAuth();
  return { data: session, status };
}

export function useUser(): { user: User | null; isLoading: boolean } {
  const { session, status } = useAuth();
  return {
    user: session?.user || null,
    isLoading: status === "loading",
  };
}

export function useIsAuthenticated(): boolean {
  const { status } = useAuth();
  return status === "authenticated";
}

export function useIsAdmin(): boolean {
  const { session } = useAuth();
  const role = session?.user?.role
  return role?.toUpperCase() === "ADMIN"
}

export function useIsNodeOfficer(): boolean {
  const { session } = useAuth();
  const role = session?.user?.role;
  return (
    role?.toUpperCase() === "NODE_OFFICER" || role?.toUpperCase() === "ADMIN"
  )
} 