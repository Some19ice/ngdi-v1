"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { UserRole } from "@/lib/auth/constants"
import { useAuthSession } from "@/hooks/use-auth-session"
import { redirect } from "next/navigation"
import { AUTH_PATHS } from "@/lib/auth/paths"

// Define the user type
interface AdminUser {
  id: string
  email: string
  role: string
}

// Create a context for the admin user
const AdminUserContext = createContext<AdminUser | null>(null)

// Hook to use the admin user
export function useAdminUser() {
  const context = useContext(AdminUserContext)
  if (!context) {
    throw new Error("useAdminUser must be used within an AdminAuthProvider")
  }
  return context
}

// Provider component
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isAuthenticated, isLoading } = useAuthSession()
  const [user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    // Handle client-side redirects
    const handleRedirect = (path: string) => {
      // Use window.location for client-side redirects
      if (typeof window !== "undefined") {
        window.location.href = path
      }
    }

    // If authentication is complete and user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login")
      handleRedirect(AUTH_PATHS.SIGNIN)
      return
    }

    // If user is authenticated but not an admin, redirect to home
    if (!isLoading && isAuthenticated && authUser?.role !== UserRole.ADMIN) {
      console.log("User is not an admin, redirecting to home")
      handleRedirect("/")
      return
    }

    // If user is authenticated and is an admin, set the user
    if (!isLoading && isAuthenticated && authUser?.role === UserRole.ADMIN) {
      console.log("User is authenticated and is an admin, setting user")
      setUser({
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
      })
    }
  }, [isLoading, isAuthenticated, authUser])

  // Show loading state or nothing while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <AdminUserContext.Provider value={user}>
      {children}
    </AdminUserContext.Provider>
  )
}
