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
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleSession = async () => {
      if (status !== "loading") {
        setIsLoading(false)
      }
    }

    handleSession()
  }, [status])

  const userRole = useMemo(
    () => session?.user?.role as UserRole | null,
    [session]
  )

  const validRoles = useMemo(
    () => [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
    []
  )

  const isValidRole = useMemo(
    () => (userRole ? validRoles.includes(userRole) : false),
    [userRole, validRoles]
  )

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
