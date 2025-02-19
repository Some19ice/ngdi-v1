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
    if (!isLoading && status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (!isLoading && status === "authenticated" && userRole) {
      if (!allowedRoles.includes(userRole)) {
        router.push("/unauthorized")
      }
    }
  }, [status, userRole, isLoading, router, allowedRoles])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  if (
    status === "authenticated" &&
    userRole &&
    !allowedRoles.includes(userRole)
  ) {
    return null
  }

  return <>{children}</>
}
