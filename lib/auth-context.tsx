"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { authClient, Session, User } from "./auth-client"
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
  const [initialized, setInitialized] = useState(false)

  // Refresh session function - using useCallback to maintain stable reference
  const refreshSession = useCallback(async () => {
    try {
      // Don't change status to loading during background refreshes if already authenticated
      // This prevents UI flickering during token refresh
      const currentStatus = status
      const newSession = await authClient.getSession()

      if (newSession) {
        setSession(newSession)
        if (currentStatus !== "authenticated") {
          setStatus("authenticated")
        }
      } else {
        // Only change to unauthenticated if we were previously authenticated
        // This makes session expiration more graceful
        if (currentStatus === "authenticated") {
          console.warn("Session refresh failed - user no longer authenticated")
          setSession(null)
          setStatus("unauthenticated")
        }
      }
    } catch (error) {
      console.error("Failed to refresh session:", error)
      // Don't automatically set to unauthenticated on network errors
      // This prevents sidebar from disappearing due to temporary API issues
      if (session === null) {
        setStatus("unauthenticated")
      }
    }
  }, [status, session])

  // Initialize session on mount with better error handling and timeout
  useEffect(() => {
    let isMounted = true
    // Initialize with a timeout that will be cleared if we unmount before the effect completes
    let initializationTimeout = setTimeout(() => {
      if (isMounted && status === "loading") {
        console.warn(
          "Session initialization timed out, setting to unauthenticated"
        )
        setStatus("unauthenticated")
      }
    }, 3000) // 3 second timeout as fallback

    // Track the last refresh time to prevent frequent refreshes
    const lastRefreshTime = Date.now() - 30000 // Initialize to 30 seconds ago

    const initSession = async () => {
      try {
        console.log("AuthProvider: Initializing session")

        // Only refresh if we haven't refreshed recently (within the last 10 seconds)
        if (Date.now() - lastRefreshTime > 10000) {
          // Get the session - we don't need to call refreshSession() here
          // as it will be called by the refresh interval if needed
          const session = await authClient.getSession()

          if (isMounted) {
            console.log("AuthProvider: Session initialized", {
              isAuthenticated: !!session,
              userRole: session?.user?.role,
            })
            setSession(session || null)
            setStatus(session ? "authenticated" : "unauthenticated")
          }
        } else {
          console.log("AuthProvider: Skipping refresh, last refresh too recent")
        }
      } catch (error) {
        console.error("Error initializing session:", error)
        if (isMounted) {
          setStatus("unauthenticated")
        }
      } finally {
        if (isMounted) {
          setInitialized(true)
        }
      }
    }

    initSession()

    return () => {
      isMounted = false
      clearTimeout(initializationTimeout)
    }
  }, [refreshSession])

  // Set up session refresh interval with better error handling
  useEffect(() => {
    let isRefreshing = false
    let lastRefreshTime = 0

    const refreshIntervalHandler = async () => {
      // Skip if already refreshing or not authenticated
      if (isRefreshing || status !== "authenticated") return

      // Skip if we refreshed in the last 30 seconds (prevents duplicate refreshes)
      if (Date.now() - lastRefreshTime < 30000) {
        console.log("Skipping scheduled refresh - last refresh too recent")
        return
      }

      try {
        isRefreshing = true
        console.log("Performing scheduled session refresh")
        lastRefreshTime = Date.now()
        await refreshSession()
      } catch (error) {
        console.error("Scheduled session refresh failed:", error)
        // Don't change authentication state on refresh errors
      } finally {
        isRefreshing = false
      }
    }

    // Refresh session every 15 minutes instead of 9 minutes to reduce API load
    const refreshInterval = setInterval(refreshIntervalHandler, 15 * 60 * 1000)

    // Also refresh when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        status === "authenticated"
      ) {
        refreshIntervalHandler()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(refreshInterval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [status, refreshSession])

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