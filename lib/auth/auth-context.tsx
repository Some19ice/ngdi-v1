"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react"
import { Session } from "next-auth"
import { useSession, signOut } from "next-auth/react"
import { UserRole } from "./types"
import {
  isSessionExpired,
  shouldRefreshSession,
  sanitizeSession,
} from "./validation"
import { AUTH_CONFIG } from "./config"

// Define a type for the session with error property
type ExtendedSession = Omit<Session, "expires"> & {
  error?: string
  expires: string | Date
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: UserRole
    organization?: string | null
    department?: string | null
    phone?: string | null
    emailVerified?: Date | null
    lastLogin?: Date | null
  } | null
}

interface AuthContextType {
  session: ExtendedSession | null
  status: "loading" | "authenticated" | "unauthenticated"
  userRole: UserRole | null
  isValidRole: boolean
  isLoading: boolean
  error: string | null
  refreshSession: () => Promise<void>
  validateSession: () => Promise<boolean>
  clearSession: () => Promise<void>
}

const defaultContext: AuthContextType = {
  session: null,
  status: "loading",
  userRole: null,
  isValidRole: false,
  isLoading: true,
  error: null,
  refreshSession: async () => {},
  validateSession: async () => false,
  clearSession: async () => {},
}

const AuthContext = createContext<AuthContextType>(defaultContext)

// Helper to safely get user role
function getUserRole(session: ExtendedSession | null): UserRole | null {
  if (!session?.user?.role) return null
  const role = session.user.role
  return Object.values(UserRole).includes(role) ? role : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, status: sessionStatus, update } = useSession()
  const [session, setSession] = useState<ExtendedSession | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await update()
      if (result) {
        const sanitizedSession = sanitizeSession(result)
        if (sanitizedSession) {
          setSession(sanitizedSession as ExtendedSession)
          setError(null)
        } else {
          throw new Error("Invalid session data")
        }
      }
    } catch (err) {
      console.error("Failed to refresh session:", err)
      setError("Failed to refresh session")
      await signOut({ redirect: false })
    } finally {
      setIsLoading(false)
    }
  }, [update])

  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!session) return false

    try {
      // Check session expiry
      if (isSessionExpired(session.expires)) {
        await signOut({ redirect: false })
        return false
      }

      // Check if session needs refresh
      if (shouldRefreshSession(session.expires)) {
        await refreshSession()
      }

      return true
    } catch (err) {
      console.error("Session validation failed:", err)
      return false
    }
  }, [session, refreshSession])

  const clearSession = useCallback(async () => {
    try {
      await signOut({ redirect: false })
      setSession(null)
      setError(null)
    } catch (err) {
      console.error("Failed to clear session:", err)
      setError("Failed to clear session")
    }
  }, [])

  useEffect(() => {
    if (sessionData) {
      const sanitizedSession = sanitizeSession(sessionData)
      if (sanitizedSession) {
        setSession(sanitizedSession as ExtendedSession)
        setError(null)
      } else {
        setError("Invalid session data")
        clearSession()
      }
    }
    setIsLoading(false)
  }, [sessionData, clearSession])

  // Set up session refresh interval
  useEffect(() => {
    if (!session) return

    const checkInterval = setInterval(async () => {
      const isValid = await validateSession()
      if (!isValid) {
        clearSession()
      }
    }, AUTH_CONFIG.cache.sessionDuration)

    return () => clearInterval(checkInterval)
  }, [session, validateSession, clearSession])

  const userRole = useMemo(() => getUserRole(session), [session])
  const isValidRole = useMemo(
    () => !!userRole && Object.values(UserRole).includes(userRole),
    [userRole]
  )

  const contextValue = useMemo(
    () => ({
      session,
      status: sessionStatus,
      userRole,
      isValidRole,
      isLoading,
      error,
      refreshSession,
      validateSession,
      clearSession,
    }),
    [
      session,
      sessionStatus,
      userRole,
      isValidRole,
      isLoading,
      error,
      refreshSession,
      validateSession,
      clearSession,
    ]
  )

  if (process.env.NODE_ENV === "development") {
    console.group("Auth Context Debug")
    console.log("Status:", sessionStatus)
    console.log("Session:", session)
    console.log("User role:", userRole)
    console.log("Role is valid:", isValidRole)
    console.log("Loading:", isLoading)
    console.log("Error:", error)
    console.groupEnd()
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
