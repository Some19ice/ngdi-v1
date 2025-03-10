"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
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
  const { user, isLoading, userRole, isAdmin } = useAuth()
  const router = useRouter()

  console.log("ProtectedRoute rendered with:", {
    hasUser: !!user,
    userRole,
    isAdmin,
    isLoading,
    allowedRoles,
    pathname:
      typeof window !== "undefined" ? window.location.pathname : "unknown",
  })

  // Helper function to normalize role for comparison
  const isRoleAllowed = (
    role: string | null,
    allowedRoles: UserRole[] | undefined
  ): boolean => {
    if (!role || !allowedRoles) return false

    // Special case for admin - always allow access
    if (
      role.toUpperCase() === UserRole.ADMIN ||
      role === "0" || // Some systems use numeric role codes
      role === "admin" ||
      role === "Admin"
    ) {
      console.log("Admin role detected, allowing access")
      return true
    }

    // Convert role to uppercase for case-insensitive comparison
    const normalizedRole = role.toUpperCase()

    // Check if the normalized role is in the allowed roles (case-insensitive)
    return allowedRoles.some(
      (allowedRole) => allowedRole.toUpperCase() === normalizedRole
    )
  }

  useEffect(() => {
    console.log("Protected Route - User:", user)
    console.log("Protected Route - User role:", userRole)
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
      router.push(AUTH_PATHS.SIGNIN)
      return
    }

    // Special case for admin - always allow access
    if (!isLoading && user && isAdmin) {
      console.log("Protected Route - User is admin, allowing access")
      return
    }

    if (
      !isLoading &&
      user &&
      allowedRoles &&
      !isRoleAllowed(userRole, allowedRoles)
    ) {
      console.log(
        `Protected Route - User role ${userRole} not in allowed roles, redirecting to home`
      )
      router.push("/")
    }
  }, [user, isLoading, router, allowedRoles, userRole, isAdmin])

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

  if (allowedRoles && !isRoleAllowed(userRole, allowedRoles)) {
    return null
  }

  return <>{children}</>
}
