"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient, Session, User } from "./auth-client";
import { useRouter } from "next/navigation"

interface AuthContextType {
  session: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading")
  const router = useRouter()

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await authClient.getSession()
        if (session) {
          setSession(session)
          setStatus("authenticated")
        } else {
          setSession(null)
          setStatus("unauthenticated")
        }
      } catch (error) {
        console.error("Failed to initialize session:", error)
        setSession(null)
        setStatus("unauthenticated")
      }
    }

    initSession()
  }, [])

  // Set up session refresh interval
  useEffect(() => {
    // Refresh session every 10 minutes
    const refreshInterval = setInterval(
      async () => {
        try {
          if (status === "authenticated") {
            await refreshSession()
          }
        } catch (error) {
          console.error("Failed to refresh session:", error)
        }
      },
      10 * 60 * 1000
    ) // 10 minutes

    return () => clearInterval(refreshInterval)
  }, [status])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setStatus("loading")
      const newSession = await authClient.login(email, password)
      setSession(newSession)
      setStatus("authenticated")

      // Avoid immediate refresh to prevent potential loops
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Login failed:", error)
      setStatus("unauthenticated")
      throw error
    }
  }

  // Register function
  const register = async (email: string, password: string, name?: string) => {
    try {
      setStatus("loading")
      const newSession = await authClient.register(email, password, name)
      setSession(newSession)
      setStatus("authenticated")

      // Avoid immediate refresh to prevent potential loops
      setTimeout(() => {
        router.refresh()
      }, 100)
    } catch (error) {
      console.error("Registration failed:", error)
      setStatus("unauthenticated")
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setStatus("loading")
      await authClient.logout()
      setSession(null)
      setStatus("unauthenticated")

      // Force a page reload to clear any client-side state
      window.location.href = "/auth/signin"
    } catch (error) {
      console.error("Logout failed:", error)
      // Still clear the session even if the API call fails
      setSession(null)
      setStatus("unauthenticated")
    }
  }

  // Refresh session function
  const refreshSession = async () => {
    try {
      const newSession = await authClient.getSession()
      if (newSession) {
        setSession(newSession)
        setStatus("authenticated")
      } else {
        setSession(null)
        setStatus("unauthenticated")
      }
    } catch (error) {
      console.error("Failed to refresh session:", error)
      setSession(null)
      setStatus("unauthenticated")
    }
  }

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
  )
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