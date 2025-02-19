"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"
import { UserRole } from "./types"

interface AuthContextType {
  session: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
  userRole: UserRole | null
  isValidRole: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
  userRole: null,
  isValidRole: false,
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update: updateSession } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  // Memoize valid roles to prevent recreation
  const validRoles = useMemo(
    () => [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
    []
  )

  // Memoize user role with proper type checking
  const userRole = useMemo(() => {
    if (!session?.user?.role) return null
    const role = session.user.role as string
    return validRoles.includes(role as UserRole) ? (role as UserRole) : null
  }, [session, validRoles])

  // Memoize role validation
  const isValidRole = useMemo(
    () => Boolean(userRole && validRoles.includes(userRole)),
    [userRole, validRoles]
  )

  // Handle session initialization and updates
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (status === "loading") {
          setIsLoading(true)
          return
        }

        if (status === "authenticated" && session) {
          // Ensure session is up to date
          await updateSession()
          setIsLoading(false)
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up session check interval
    const interval = setInterval(async () => {
      if (status === "authenticated") {
        await updateSession()
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [status, session, updateSession])

  // Memoize context value
  const value = useMemo(
    () => ({
      session,
      status,
      userRole,
      isValidRole,
      isLoading,
    }),
    [session, status, userRole, isValidRole, isLoading]
  )

  if (process.env.NODE_ENV === "development") {
    // Debug logging
    console.log("Auth Status:", status)
    console.log("Session:", session)
    console.log("User role:", userRole)
    console.log("Role is valid:", isValidRole)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
