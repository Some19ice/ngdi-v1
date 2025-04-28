"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserRole } from "@/lib/auth/constants"
import { useAuthSession } from "@/hooks/use-auth-session"
import { AUTH_PATHS } from "@/lib/auth/paths"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallback = (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ),
}: ProtectedRouteProps) {
  const router = useRouter()
  const { session, isLoading } = useAuthSession()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // Check authentication
    if (!isLoading) {
      const isAuthenticated = !!session?.user

      if (!isAuthenticated) {
        // User is not authenticated, redirect to login
        router.push(AUTH_PATHS.SIGNIN)
        setAuthorized(false)
        return
      }

      // Check role-based access if roles are specified
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = session.user.role
        const hasRequiredRole = allowedRoles.includes(userRole)

        if (!hasRequiredRole) {
          // User doesn't have the required role, redirect to unauthorized
          router.push(AUTH_PATHS.UNAUTHORIZED)
          setAuthorized(false)
          return
        }
      }

      // User is authenticated and has the required role
      setAuthorized(true)
    }
  }, [isLoading, session, router, allowedRoles])

  // Show loading state while checking authentication
  if (isLoading || authorized === null) {
    return fallback
  }

  // Show children only if authorized
  return authorized ? <>{children}</> : fallback
}
