import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { UserRole } from "@prisma/client"

// Constants
const AUTH_COOKIE_NAME = "auth_token"

// Mock user for demo mode
const DEMO_USER = {
  id: "demo-user-id",
  email: "demo@example.com",
  name: "Demo Admin User",
  role: UserRole.ADMIN,
}

/**
 * Server-side function to check if the user is authenticated
 * In demo mode, always returns the mock admin user
 */
export async function requireAuth(redirectTo?: string) {
  console.log("[DEMO MODE] Bypassing authentication check")
  return DEMO_USER
}

/**
 * Server-side function to check if the user has the required role
 * In demo mode, always returns the mock admin user
 */
export async function requireRole(allowedRoles: UserRole[]) {
  console.log("[DEMO MODE] Bypassing role check")
  return DEMO_USER
}

/**
 * Server-side function to redirect authenticated users away from auth pages
 * In demo mode, does nothing to avoid redirects
 */
export async function redirectIfAuthenticated(redirectTo: string = "/") {
  console.log("[DEMO MODE] Bypassing redirect check")
  // No redirect in demo mode
}

/**
 * Server-side function to get the current user without redirecting
 * In demo mode, always returns the mock admin user
 */
export async function getCurrentUser() {
  console.log("[DEMO MODE] Returning mock user")
  return DEMO_USER
}

/**
 * Server-side function to check if the user is a Node Officer
 * In demo mode, always returns the mock admin user
 */
export async function requireNodeOfficer(redirectTo?: string) {
  console.log("[DEMO MODE] Bypassing Node Officer check")
  return DEMO_USER
}
