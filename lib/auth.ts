import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { validateJwtToken } from "./auth-client"
import { UserRole } from "@prisma/client"

// Constants
const AUTH_COOKIE_NAME = "auth_token"

/**
 * Server-side function to check if the user is authenticated
 * Returns the user data if authenticated, otherwise redirects to signin
 */
export async function requireAuth(redirectTo?: string) {
  // Check for auth cookie in the request
  const authToken = cookies().get(AUTH_COOKIE_NAME)?.value

  if (!authToken) {
    const redirectPath = redirectTo
      ? `/auth/signin?from=${encodeURIComponent(redirectTo)}`
      : "/auth/signin"
    redirect(redirectPath)
  }

  try {
    // Validate the token
    const validationResult = await validateJwtToken(authToken)

    if (!validationResult.isValid) {
      console.error("Invalid auth token:", validationResult.error)
      const redirectPath = redirectTo
        ? `/auth/signin?from=${encodeURIComponent(redirectTo)}`
        : "/auth/signin"
      redirect(redirectPath)
    }

    // Extract user information from the token
    return {
      id: validationResult.userId || "unknown-id",
      email: validationResult.email || "unknown@example.com",
      name: "Authenticated User",
      role: validationResult.role || UserRole.USER,
    }
  } catch (error) {
    console.error("Error validating auth token:", error)
    const redirectPath = redirectTo
      ? `/auth/signin?from=${encodeURIComponent(redirectTo)}`
      : "/auth/signin"
    redirect(redirectPath)
  }
}

/**
 * Server-side function to check if the user has the required role
 */
export async function requireRole(allowedRoles: UserRole[]) {
  try {
    const user = await requireAuth()

    console.log("Checking user role:", {
      userRole: user.role,
      allowedRoles,
      hasRequiredRole: user.role ? allowedRoles.includes(user.role) : false,
    })

    // Always allow ADMIN users to access any protected route
    if (user.role === UserRole.ADMIN) {
      console.log("ADMIN user granted access")
      return user
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      console.log(
        "User does not have required role, redirecting to unauthorized"
      )
      redirect("/unauthorized")
    }

    return user
  } catch (error) {
    console.error("Error in requireRole:", error)
    redirect("/unauthorized")
  }
}

/**
 * Server-side function to redirect authenticated users away from auth pages
 */
export async function redirectIfAuthenticated(redirectTo: string = "/") {
  // Check for auth cookie in the request
  const authToken = cookies().get(AUTH_COOKIE_NAME)?.value

  if (authToken) {
    redirect(redirectTo)
  }
}

/**
 * Server-side function to get the current user without redirecting
 * Returns the user data if authenticated, otherwise returns null
 */
export async function getCurrentUser() {
  // Check for auth cookie in the request
  const authToken = cookies().get(AUTH_COOKIE_NAME)?.value

  if (!authToken) {
    return null
  }

  try {
    // Validate the token
    const validationResult = await validateJwtToken(authToken)

    if (!validationResult.isValid) {
      return null
    }

    // Extract user information from the token
    return {
      id: validationResult.userId || "unknown-id",
      email: validationResult.email || "unknown@example.com",
      name: "Authenticated User",
      role: validationResult.role || UserRole.USER,
    }
  } catch (error) {
    console.error("Error validating auth token:", error)
    return null
  }
}
