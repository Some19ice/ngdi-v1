"use client"

import { UserRole } from "@/lib/auth/constants"
import { useAuthSession } from "@/hooks/use-auth-session"

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: UserRole | UserRole[]
  fallback?: React.ReactNode
}

/**
 * A component that conditionally renders content based on user roles
 * @param children The content to render if the user has the required role
 * @param allowedRoles The role(s) that are allowed to see the content
 * @param fallback Optional fallback component to render if the user doesn't have the required role
 */
export function RoleGate({
  children,
  allowedRoles,
  fallback = null,
}: RoleGateProps) {
  const { session } = useAuthSession()
  
  // Convert single role to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  // Check if user has any of the allowed roles
  const hasAllowedRole = session?.user && roles.includes(session.user.role)
  
  // Render children if user has allowed role, otherwise render fallback
  return <>{hasAllowedRole ? children : fallback}</>
}

export default RoleGate
