import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { UserRole } from "@prisma/client"
import { validateJwtToken } from "./auth-client"

// Constants
const AUTH_COOKIE_NAME = "auth_token"

/**
 * Server-side function to get the logged in user without redirection
 * @returns The user object if authenticated, null otherwise
 */
async function getLoggedInUser() {
  // This function is only called in dynamic contexts
  const cookieStore = cookies()

  // Check for auth cookie in the request
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value

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
      profileCompleted: false,
    }
  } catch (error) {
    console.error("Error validating auth token:", error)
    return null
  }
}

/**
 * Server-side function to check if the user is authenticated
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getLoggedInUser()

  if (!user) {
    if (redirectTo) {
      redirect(redirectTo)
    }
    return null
  }

  return user
}

/**
 * Server-side function to check if the user has the required role
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getLoggedInUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }

  return user
}

/**
 * Server-side function to redirect authenticated users away from auth pages
 */
export async function redirectIfAuthenticated(redirectTo: string = "/") {
  const user = await getLoggedInUser()

  if (user) {
    redirect(redirectTo)
  }
}

/**
 * Server-side function to get the current user without redirecting
 */
export async function getCurrentUser() {
  return await getLoggedInUser()
}

/**
 * Server-side function to check if the user is a Node Officer
 */
export async function requireNodeOfficer(redirectTo?: string) {
  const user = await getLoggedInUser()

  if (!user) {
    if (redirectTo) {
      redirect(redirectTo)
    }
    return null
  }

  if (user.role !== UserRole.NODE_OFFICER && user.role !== UserRole.ADMIN) {
    redirect("/unauthorized")
  }

  return user
}
