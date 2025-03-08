"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { type Session, type User } from "@supabase/supabase-js"
import { type Permission, type UserRole } from "@/lib/auth/types"
import { can, canAll, canAny } from "@/lib/auth/rbac"

interface UserSession {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  factor_id?: string
  aal?: string
  not_after?: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  userRole: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  signOutFromDevice: (sessionId: string) => Promise<void>
  signOutFromAllDevices: () => Promise<void>
  getSessions: () => Promise<UserSession[]>
  refreshSession: () => Promise<void>
  can: (permission: Permission) => boolean
  canAll: (permissions: Permission[]) => boolean
  canAny: (permissions: Permission[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting initial session:", error)
          return
        }

        if (initialSession) {
          setSession(initialSession)
          setUser(initialSession.user)
          setUserRole(initialSession.user.user_metadata.role as UserRole)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
        setUserRole(currentSession.user.user_metadata.role as UserRole)
      } else {
        setSession(null)
        setUser(null)
        setUserRole(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signOutFromDevice = async (sessionId: string) => {
    const { error } = await supabase.auth.admin.signOut(sessionId)
    if (error) throw error
  }

  const signOutFromAllDevices = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" })
    if (error) throw error
  }

  const getSessions = async () => {
    if (!user?.id) return []
    const { data, error } = await supabase.rpc("get_user_sessions", {
      user_id: user.id,
    })
    if (error) throw error
    return data as UserSession[]
  }

  const refreshSession = async () => {
    const { error } = await supabase.auth.refreshSession()
    if (error) throw error
  }

  const checkPermission = (permission: Permission): boolean => {
    if (!user || !userRole || !user.email) return false
    return can({ ...user, role: userRole, email: user.email }, permission)
  }

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user || !userRole || !user.email) return false
    return canAll({ ...user, role: userRole, email: user.email }, permissions)
  }

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user || !userRole || !user.email) return false
    return canAny({ ...user, role: userRole, email: user.email }, permissions)
  }

  const value = {
    session,
    user,
    userRole,
    isLoading,
    isAuthenticated: !!session,
    signOut,
    signOutFromDevice,
    signOutFromAllDevices,
    getSessions,
    refreshSession,
    can: checkPermission,
    canAll: checkAllPermissions,
    canAny: checkAnyPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

