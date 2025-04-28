"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserRole } from "@/lib/auth/constants"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  fallback?: React.ReactNode
}

/**
 * A component that protects routes by checking authentication and role-based access
 * @param children The content to render if the user is authorized
 * @param allowedRoles Optional array of roles that are allowed to access the route
 * @param fallback Optional fallback component to render while checking authorization
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  fallback = (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ),
}: ProtectedRouteProps) {
  const { session, isLoading, status } = useSupabaseAuth()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Check authentication
    if (!isLoading) {
      const isAuthenticated = !!session?.user

      if (!isAuthenticated) {
        // User is not authenticated, redirect to login
        router.push(AUTH_CONFIG.pages.signIn)
        setAuthorized(false)
        return
      }

      // Check role-based access if roles are specified
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = session.user.role
        const hasRequiredRole = allowedRoles.includes(userRole)

        if (!hasRequiredRole) {
          // User doesn't have the required role, redirect to unauthorized
          router.push(AUTH_CONFIG.pages.unauthorized)
          setAuthorized(false)
          return
        }
      }

      // User is authenticated and has the required role
      setAuthorized(true)
    }
  }, [isLoading, session, router, allowedRoles])

  // Show fallback while loading or if not authorized
  if (isLoading || !authorized) {
    return <>{fallback}</>
  }

  // Show children if authorized
  return <>{children}</>
}

export default ProtectedRoute
