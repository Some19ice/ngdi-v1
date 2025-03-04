"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { UserRole } from "@/lib/auth/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/use-toast"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  allowedRoles = [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
}: ProtectedRouteProps) {
  const { status, userRole, isLoading, error, session } = useAuth()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  // Handle auth status changes
  useEffect(() => {
    // Wait for initial auth check
    if (!isInitialized && (isLoading || status === "loading")) {
      return
    }

    // Mark as initialized after first auth check
    if (!isInitialized) {
      setIsInitialized(true)
    }

    const handleAuthChange = async () => {
      try {
        if (status === "unauthenticated") {
          const callbackUrl = encodeURIComponent(window.location.pathname)
          router.push(`/auth/signin?callbackUrl=${callbackUrl}`)
          return
        }

        if (status === "authenticated") {
          // Handle missing role
          if (!userRole) {
            console.error("Authenticated but no user role found")
            router.push("/auth/error?error=no_role")
            return
          }

          // Handle unauthorized role
          if (!allowedRoles.includes(userRole)) {
            router.push("/unauthorized")
            return
          }
        }
      } catch (err) {
        console.error("Protected route auth change error:", err)
        router.push("/auth/error")
      }
    }

    void handleAuthChange()
  }, [status, userRole, isLoading, router, allowedRoles, isInitialized])

  // Handle auth errors
  useEffect(() => {
    if (isInitialized && !isLoading && error) {
      console.error("Protected route detected auth error:", error)

      // Check if the error is related to token refresh
      const isTokenError =
        error.includes("expired") ||
        error.includes("session") ||
        error.includes("token") ||
        error.includes("authentication")

      toast({
        title: isTokenError ? "Session Expired" : "Authentication Error",
        description: error,
        variant: "destructive",
      })

      // Redirect to sign-in page with both error and callback URL
      const callbackUrl = encodeURIComponent(window.location.pathname)
      const errorParam = encodeURIComponent(error)
      router.push(`/auth/signin?error=${errorParam}&callbackUrl=${callbackUrl}`)
    }
  }, [error, isLoading, router, isInitialized])

  // Also check session directly for errors
  useEffect(() => {
    if (isInitialized && !isLoading && session?.error && !error) {
      console.error("Protected route detected session error:", session.error)

      toast({
        title: "Session Error",
        description:
          "Your session has encountered an error. Please sign in again.",
        variant: "destructive",
      })

      const callbackUrl = encodeURIComponent(window.location.pathname)
      router.push(`/auth/signin?error=session_error&callbackUrl=${callbackUrl}`)
    }
  }, [session, error, isLoading, router, isInitialized])

  // Show loading state during initialization
  if (!isInitialized || isLoading || status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render anything while redirecting
  if (status === "unauthenticated" || error) {
    return null
  }

  // Don't render if user doesn't have required role
  if (
    status === "authenticated" &&
    (!userRole || !allowedRoles.includes(userRole))
  ) {
    return null
  }

  // Only render children when fully initialized and authorized
  return isInitialized ? <>{children}</> : null
}
