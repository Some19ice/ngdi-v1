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
  login: (email: string, password: string) => Promise<Session | void>
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

// Add TypeScript declaration for window properties
declare global {
  interface Window {
    __lastSessionRefresh: number
    __authGlobals?: AuthGlobals
  }
}

// Add a global navigation lock to prevent multiple redirects
interface AuthGlobals {
  isNavigating: boolean
  lastNavigationTimestamp: number
  lastSessionRefreshTimestamp: number
}

// Initialize global object in client-side only
const authGlobals: AuthGlobals =
  typeof window !== "undefined"
    ? window.__authGlobals ||
      (window.__authGlobals = {
        isNavigating: false,
        lastNavigationTimestamp: 0,
        lastSessionRefreshTimestamp: 0,
      })
    : {
        isNavigating: false,
        lastNavigationTimestamp: 0,
        lastSessionRefreshTimestamp: 0,
      }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading")
  const router = useRouter()
  const [initialized, setInitialized] = useState(false)

  // Refresh session function - using useCallback to maintain stable reference
  const refreshSession = useCallback(
    async (force = false) => {
      try {
        // Don't refresh if we're already in a client-side navigation
        if (authGlobals.isNavigating && !force) {
          console.log("Skipping session refresh during navigation")
          return
        }

        // Don't change status to loading during background refreshes if already authenticated
        // This prevents UI flickering during token refresh
        const currentStatus = status

        // Check if we refreshed recently (within last 30 seconds) and not forcing
        const now = Date.now()
        if (!force && now - authGlobals.lastSessionRefreshTimestamp < 30000) {
          console.log("Skipping session refresh - last refresh too recent")
          return
        }

        const newSession = await authClient.getSession()

        if (newSession) {
          setSession(newSession)
          if (currentStatus !== "authenticated") {
            setStatus("authenticated")
          }
          // Update the timestamp
          authGlobals.lastSessionRefreshTimestamp = Date.now()
        } else {
          // Only change to unauthenticated if we were previously authenticated
          // This makes session expiration more graceful
          if (currentStatus === "authenticated") {
            console.warn(
              "Session refresh failed - user no longer authenticated"
            )
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
    },
    [status, session]
  )

  // Initialize session on mount with better error handling and timeout
  useEffect(() => {
    let isMounted = true

    // Use a shorter timeout for initial load
    let initializationTimeout = setTimeout(() => {
      if (isMounted && status === "loading") {
        console.warn(
          "Session initialization timed out, setting to unauthenticated"
        )
        setStatus("unauthenticated")
      }
    }, 2000) // Reduced from 3s to 2s for faster initial load

    const initSession = async () => {
      try {
        console.log("AuthProvider: Initializing session")

        // Quick check for cookies before calling getSession
        // This helps immediately handle cleared browser data
        const hasCookies =
          typeof document !== "undefined" &&
          (document.cookie.includes("auth_token") ||
            document.cookie.includes("refresh_token"))

        if (!hasCookies) {
          console.log(
            "No auth cookies found during initialization, setting unauthenticated"
          )
          setStatus("unauthenticated")
          setSession(null)
          setInitialized(true)
          return
        }

        // Get the session with priority=true for initial load
        const session = await authClient.getSession()

        if (isMounted) {
          // Update refresh timestamp
          authGlobals.lastSessionRefreshTimestamp = Date.now()
          setSession(session || null)
          setStatus(session ? "authenticated" : "unauthenticated")
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
  }, [])

  // Set up session refresh interval with better error handling
  useEffect(() => {
    let isRefreshing = false
    let lastRefreshAttemptTime = 0

    const refreshIntervalHandler = async () => {
      // Skip if already refreshing or not authenticated
      if (isRefreshing || status !== "authenticated") return

      // Check if cookies still exist - critical for handling cleared browser data
      const hasCookies =
        typeof document !== "undefined" &&
        (document.cookie.includes("auth_token") ||
          document.cookie.includes("refresh_token"))

      if (!hasCookies && status === "authenticated") {
        console.log(
          "Auth cookies missing but status is authenticated - logging out"
        )
        setSession(null)
        setStatus("unauthenticated")
        return
      }

      // Skip if we attempted a refresh in the last 2 minutes (prevents duplicate refreshes)
      if (Date.now() - lastRefreshAttemptTime < 120000) {
        return
      }

      try {
        isRefreshing = true
        lastRefreshAttemptTime = Date.now()
        await refreshSession()
      } catch (error) {
        console.error("Scheduled session refresh failed:", error)
        // Don't change authentication state on refresh errors
      } finally {
        isRefreshing = false
      }
    }

    // Refresh session every 30 minutes instead of 15 minutes to reduce API load
    const refreshInterval = setInterval(refreshIntervalHandler, 30 * 60 * 1000)

    // Only refresh when tab becomes visible if it's been at least 5 minutes since last refresh
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        status === "authenticated" &&
        Date.now() - authGlobals.lastSessionRefreshTimestamp > 5 * 60 * 1000
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

      // Important: Set session state before any navigation attempt
      setSession(newSession)
      setStatus("authenticated")

      // Track authentication timing to avoid refresh loops
      if (typeof window !== "undefined") {
        window.__lastSessionRefresh = Date.now()

        // Mark that we're handling authentication - this prevents concurrent redirects
        authGlobals.isNavigating = true
        authGlobals.lastNavigationTimestamp = Date.now()

        // Release the navigation lock after 2 seconds in case something goes wrong
        setTimeout(() => {
          authGlobals.isNavigating = false
        }, 2000)
      }

      // Don't refresh the route here - let the redirect handle it
      return newSession
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
      // Don't set status to loading immediately to prevent UI flicker
      // Only do this if not already navigating
      if (!authGlobals.isNavigating) {
        setStatus("loading")

        // Mark that we're handling navigation
        authGlobals.isNavigating = true
        authGlobals.lastNavigationTimestamp = Date.now()

        await authClient.logout()

        // Clear session state
        setSession(null)
        setStatus("unauthenticated")

        // Force a page reload to clear any client-side state
        // Check if we're not in a recent navigation to prevent loops
        if (Date.now() - authGlobals.lastNavigationTimestamp > 500) {
          window.location.href = "/auth/signin"
        }
      } else {
        console.log("Navigation already in progress, skipping logout redirect")
      }
    } catch (error) {
      console.error("Logout failed:", error)
      // Still clear the session even if the API call fails
      setSession(null)
      setStatus("unauthenticated")
    } finally {
      // Release the navigation lock after 2 seconds
      setTimeout(() => {
        authGlobals.isNavigating = false
      }, 2000)
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