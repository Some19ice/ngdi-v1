import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { UserRole } from "./constants"
import AUTH_CONFIG from "./auth-config"

// Types
export interface User {
  id: string
  email: string
  name?: string | null
  role: UserRole
  image?: string | null
}

/**
 * Gets the current user from the server
 * @returns The current user or null if not authenticated
 */
export async function getUser(): Promise<User | null> {
  try {
    // Get the access token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get(AUTH_CONFIG.TOKEN.ACCESS_TOKEN_COOKIE)?.value
    
    if (!token) {
      return null
    }
    
    // Validate the token by making a request to the API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const response = await fetch(`${apiUrl}/api/auth/validate-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (!data.isValid) {
      return null
    }
    
    // Return the user
    return {
      id: data.userId,
      email: data.email,
      role: data.role as UserRole,
      name: data.name,
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

/**
 * Requires authentication for a route
 * @param redirectTo The path to redirect to if not authenticated
 * @returns The current user or redirects if not authenticated
 */
export async function requireAuth(redirectTo: string = AUTH_CONFIG.PATHS.SIGNIN): Promise<User> {
  const user = await getUser()
  
  if (!user) {
    redirect(redirectTo)
  }
  
  return user
}

/**
 * Requires a specific role for a route
 * @param allowedRoles The role(s) that are allowed to access the route
 * @param redirectTo The path to redirect to if not authorized
 * @returns The current user or redirects if not authorized
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[],
  redirectTo: string = AUTH_CONFIG.PATHS.UNAUTHORIZED
): Promise<User> {
  const user = await requireAuth()
  
  // Convert single role to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  // Check if user has any of the allowed roles
  const hasAllowedRole = roles.includes(user.role)
  
  if (!hasAllowedRole) {
    redirect(redirectTo)
  }
  
  return user
}

/**
 * Redirects if the user is authenticated
 * @param redirectTo The path to redirect to if authenticated
 */
export async function redirectIfAuthenticated(redirectTo: string = AUTH_CONFIG.PATHS.DEFAULT_REDIRECT): Promise<void> {
  const user = await getUser()
  
  if (user) {
    redirect(redirectTo)
  }
}

/**
 * Checks if the user has a specific role
 * @param user The user to check
 * @param role The role(s) to check
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(user: User | null, role: UserRole | UserRole[]): boolean {
  if (!user) return false
  
  // Convert single role to array
  const roles = Array.isArray(role) ? role : [role]
  
  // Check if user has any of the roles
  return roles.includes(user.role)
}

/**
 * Checks if the user is an admin
 * @param user The user to check
 * @returns True if the user is an admin, false otherwise
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, UserRole.ADMIN)
}

/**
 * Checks if the user is a node officer
 * @param user The user to check
 * @returns True if the user is a node officer or admin, false otherwise
 */
export function isNodeOfficer(user: User | null): boolean {
  return hasRole(user, [UserRole.NODE_OFFICER, UserRole.ADMIN])
}

/**
 * Server-side authentication utilities
 */
export const serverAuth = {
  getUser,
  requireAuth,
  requireRole,
  redirectIfAuthenticated,
  hasRole,
  isAdmin,
  isNodeOfficer,
}

export default serverAuth
