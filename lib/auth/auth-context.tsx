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
import { useSession, signOut as nextAuthSignOut, signIn } from "next-auth/react"
import { UserRole } from "./types"
import {
  isSessionExpired,
  shouldRefreshSession,
  sanitizeSession,
} from "./validation"
import { AUTH_CONFIG } from "./config"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@/lib/supabase-client"
import {
  type User,
  AuthChangeEvent,
  Session as SupabaseSession,
} from "@supabase/supabase-js"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"

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
  session: SupabaseSession | null
  user: User | null
  userRole: UserRole | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userRole: null,
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
})

// Helper to safely get user role
function getUserRole(session: ExtendedSession | null): UserRole | null {
  if (!session?.user?.role) return null
  const role = session.user.role
  return Object.values(UserRole).includes(role as UserRole)
    ? (role as UserRole)
    : null
}

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined"

interface AuthProviderProps {
  children: ReactNode
  initialUser?: User | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [session, setSession] = useState<SupabaseSession | null>(null)
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(!initialUser)
  const [authError, setAuthError] = useState<Error | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null)

  // Initialize Supabase client only on the client side
  useEffect(() => {
    // Only initialize the client in the browser
    if (isBrowser) {
      try {
        const client = createClient()
        setSupabase(client)
      } catch (error) {
        console.error("Error initializing Supabase client:", error)
        setAuthError(error instanceof Error ? error : new Error(String(error)))
      }
    }
  }, [])

  // Fetch user role from the database
  const fetchUserRole = useCallback(
    async (userId: string) => {
      if (!supabase || !userId) return null

      try {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .single()

        if (error) {
          console.error("Error fetching user role:", error)
          return null
        }

        if (
          data?.role &&
          Object.values(UserRole).includes(data.role as UserRole)
        ) {
          return data.role as UserRole
        }

        return null
      } catch (error) {
        console.error("Error fetching user role:", error)
        return null
      }
    },
    [supabase]
  )

  // Handle redirection based on authentication state
  const handleRedirection = useCallback(
    (role: UserRole | null) => {
      if (!isBrowser) return

      const isAuthPath = pathname?.includes("/auth/signin")

      // If we're on the sign-in page and have a valid role, redirect to home or the requested page
      if (role && isAuthPath) {
        const from = searchParams?.get("from") || "/"
        const redirectPath = from === "/auth/signin" ? "/" : from

        console.log(
          "Auth context: Redirecting authenticated user from signin to:",
          redirectPath
        )

        // Use window.location for a full page reload to clear any stale state
        window.location.href = redirectPath
      }
    },
    [pathname, searchParams]
  )

  // Fetch initial user role if we have an initialUser
  useEffect(() => {
    if (initialUser?.id && supabase) {
      console.log(
        "Auth context: Fetching role for initial user:",
        initialUser.email
      )
      fetchUserRole(initialUser.id)
        .then((role) => {
          if (role) {
            console.log("Auth context: Initial user role:", role)
            setUserRole(role)
            handleRedirection(role)
          } else {
            console.log("Auth context: No role found for initial user")
          }
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching initial user role:", error)
          setIsLoading(false)
        })
    }
  }, [initialUser, supabase, fetchUserRole, handleRedirection])

  useEffect(() => {
    // Only set up auth state change listener if supabase client is available
    if (!supabase || !isBrowser) return

    console.log("Auth context: Setting up auth state change listener")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (
        event: AuthChangeEvent,
        currentSession: SupabaseSession | null
      ) => {
        console.log("Auth context: Auth state change:", event, !!currentSession)

        setSession(currentSession)

        // Use getUser() for better security
        if (currentSession) {
          try {
            const { data, error } = await supabase.auth.getUser()
            if (error) {
              console.error("Error getting authenticated user:", error)
              setUser(null)
              setUserRole(null)
              setIsLoading(false)
              return
            }

            console.log("Auth context: User authenticated:", data.user.email)
            setUser(data.user)

            // Fetch user role if user is authenticated
            if (data.user?.id) {
              const role = await fetchUserRole(data.user.id)
              console.log("Auth context: User role:", role)
              setUserRole(role)
              handleRedirection(role)
            }
          } catch (error) {
            console.error("Error in auth state change:", error)
            setUser(null)
            setUserRole(null)
          }
        } else {
          console.log("Auth context: No session in auth state change")
          setUser(null)
          setUserRole(null)
        }

        setIsLoading(false)
      }
    )

    // Initial session check (only if we don't have initialUser)
    const checkSession = async () => {
      if (initialUser) {
        console.log(
          "Auth context: Skipping session check, using initial user:",
          initialUser.email
        )
        return
      }

      console.log("Auth context: Checking session")

      try {
        // Use getUser() for better security
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          if (error.name !== "AuthSessionMissingError") {
            console.error("Error getting authenticated user:", error)
          } else {
            console.log("Auth context: No session found")
          }
          setUser(null)
          setUserRole(null)
          setIsLoading(false)
          return
        }

        // Get the session for compatibility
        const { data: sessionData } = await supabase.auth.getSession()
        setSession(sessionData.session)

        if (data.user) {
          console.log(
            "Auth context: User found in session check:",
            data.user.email
          )
          setUser(data.user)

          if (data.user.id) {
            const role = await fetchUserRole(data.user.id)
            console.log("Auth context: User role from session check:", role)
            setUserRole(role)
            handleRedirection(role)
          } else {
            setUserRole(null)
          }
        } else {
          console.log("Auth context: No user found in session check")
          setUserRole(null)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error checking session:", error)
        setIsLoading(false)
      }
    }

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserRole, handleRedirection, initialUser])

  const signOut = async () => {
    try {
      if (supabase) {
        console.log("Auth context: Signing out")
        await supabase.auth.signOut()
      }
      setUserRole(null)
      setUser(null)
      setSession(null)

      // Use window.location for a full page reload
      window.location.href = "/auth/signin"
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  const refreshSession = async () => {
    try {
      if (supabase) {
        console.log("Auth context: Refreshing session")
        // Refresh the session
        const { data: sessionData } = await supabase.auth.refreshSession()
        setSession(sessionData.session)

        // Get the user with getUser() for better security
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          console.error("Error getting authenticated user:", error)
          return
        }

        console.log("Auth context: Session refreshed, user:", data.user.email)
        setUser(data.user)

        if (data.user?.id) {
          const role = await fetchUserRole(data.user.id)
          console.log("Auth context: User role after refresh:", role)
          setUserRole(role)
        }
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
      toast.error("Failed to refresh session")
    }
  }

  const isValidRole = useMemo(
    () => !!userRole && Object.values(UserRole).includes(userRole),
    [userRole]
  )

  const contextValue = useMemo(
    () => ({
      session,
      user,
      userRole,
      isLoading,
      signOut,
      refreshSession,
    }),
    [session, user, userRole, isLoading, signOut, refreshSession]
  )

  if (process.env.NODE_ENV === "development" && isBrowser) {
    console.group("Auth Context Debug")
    console.log("Status:", isLoading ? "loading" : "authenticated")
    console.log("Session:", session)
    console.log("User:", user?.email)
    console.log("User role:", userRole)
    console.log("Role is valid:", isValidRole)
    console.log("Loading:", isLoading)
    console.log("Auth error:", authError)
    console.groupEnd()
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
