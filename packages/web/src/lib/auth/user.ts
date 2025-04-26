import { cookies } from "next/headers"
import { validateJwtToken } from "../auth-client"
import { UserRole } from "../auth/constants"

// Auth cookie name
const AUTH_COOKIE_NAME = "auth_token"

/**
 * Server-side function to get the logged in user without redirection
 * @param cookieStore - Cookie store from next/headers
 * @returns The user object if authenticated, null otherwise
 */
export async function getLoggedInUser(cookieStore = cookies()) {
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
      profileCompleted: false, // Default values since these aren't in the token
    }
  } catch (error) {
    console.error("Error validating auth token:", error)
    return null
  }
}
