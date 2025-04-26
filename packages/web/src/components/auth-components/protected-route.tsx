"use client"

import { UserRole } from "@/lib/auth/constants"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  // For demo purposes, always render children without any authentication checks
  return <>{children}</>
}
