"use client"

import React, { createContext, useContext } from "react"
import { Session, User } from "@supabase/supabase-js"
import { useAuthSession } from "@/hooks/use-auth-session"
import { AuthUser } from "./auth/auth-types"

/**
 * Define the auth context type
 * This is a compatibility layer for components that still use the old auth context
 */
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  navigate: (path: string) => void
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth provider component
 * This is a compatibility layer that uses the new useAuthSession hook
 * but exposes the old interface for backward compatibility
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    login: loginFn,
    register: registerFn,
    logout: logoutFn,
    navigate,
  } = useAuthSession()

  // Map the new hook's methods to the old interface

  // Login function
  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      await loginFn(email, password, rememberMe)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      await registerFn(email, password, name)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await logoutFn()
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      // Use the new hook's method when implemented
      console.warn("resetPassword is not fully implemented in the new hook")
      // For now, just log a warning
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  // Update password function
  const updatePassword = async (password: string) => {
    try {
      // Use the new hook's method when implemented
      console.warn("updatePassword is not fully implemented in the new hook")
      // For now, just log a warning
    } catch (error) {
      console.error("Update password error:", error)
      throw error
    }
  }

  // Map the AuthUser to User for backward compatibility
  const mappedUser = user ? mapAuthUserToUser(user) : null

  // Create the context value
  const contextValue: AuthContextType = {
    user: mappedUser,
    session: session as Session | null,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    navigate,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

/**
 * Map AuthUser to User for backward compatibility
 */
function mapAuthUserToUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    email: authUser.email,
    user_metadata: {
      name: authUser.name,
      role: authUser.role,
      organization: authUser.organization,
      department: authUser.department,
      phone: authUser.phone,
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: authUser.createdAt || "",
    confirmed_at: authUser.emailVerified
      ? authUser.emailVerified.toISOString()
      : null,
    last_sign_in_at: authUser.lastLoginAt || null,
    role: "",
    updated_at: "",
  } as User
}

/**
 * Custom hook to use the auth context
 * This is provided for backward compatibility
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

// Export the hook as the default export
export default useAuth
