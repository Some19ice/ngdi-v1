"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { UserRole } from "@/lib/auth/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  allowedRoles = [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
}: ProtectedRouteProps) {
  const { status, userRole, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (status === "unauthenticated") {
        router.push(`/auth/signin?callbackUrl=${window.location.pathname}`)
        return
      }

      if (status === "authenticated" && userRole) {
        if (!allowedRoles.includes(userRole)) {
          router.push("/unauthorized")
          return
        }
      }
    }
  }, [status, userRole, isLoading, router, allowedRoles])

  // Show loading state
  if (isLoading || status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render anything while redirecting
  if (status === "unauthenticated") {
    return null
  }

  // Don't render if user doesn't have required role
  if (
    status === "authenticated" &&
    userRole &&
    !allowedRoles.includes(userRole)
  ) {
    return null
  }

  return <>{children}</>
}
