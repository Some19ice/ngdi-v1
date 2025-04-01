"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/hooks/use-auth-session"
import { UserRole } from "@/lib/auth/constants"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AUTH_PATHS } from "@/lib/auth/paths"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole, isAdmin, navigate } = useAuthSession()
  const router = useRouter()

  console.log("ProtectedRoute rendered with:", {
    hasUser: !!user,
    userRole: user?.role,
    isAdmin,
    isLoading,
    allowedRoles,
    pathname:
      typeof window !== "undefined" ? window.location.pathname : "unknown",
  })

  useEffect(() => {
    console.log("Protected Route - User:", user)
    console.log("Protected Route - User role:", user?.role)
    console.log("Protected Route - Is admin:", isAdmin)
    console.log("Protected Route - Allowed roles:", allowedRoles)
    console.log("Protected Route - Is loading:", isLoading)

    // Always allow access for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Protected Route - Development mode, allowing access")
      return
    }

    if (!isLoading && !user) {
      console.log("Protected Route - No user, redirecting to signin")
      // Use navigate from useAuthSession to handle navigation consistently
      navigate(AUTH_PATHS.SIGNIN)
      return
    }

    // Special case for admin - always allow access
    if (!isLoading && user && isAdmin) {
      console.log("Protected Route - User is admin, allowing access")
      return
    }

    if (!isLoading && user && allowedRoles && !hasRole(allowedRoles)) {
      console.log(
        `Protected Route - User role ${user.role} not in allowed roles, redirecting to home`
      )
      // Use navigate from useAuthSession for consistent navigation handling
      navigate("/")
    }
  }, [user, isLoading, router, allowedRoles, isAdmin, hasRole, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Special case for admin - always allow access
  if (isAdmin) {
    return <>{children}</>
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return null
  }

  return <>{children}</>
}
