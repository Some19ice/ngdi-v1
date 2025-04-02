import { getCookie, setCookie } from "./cookie-utils"
import axios from "axios"

/**
 * Ensures a CSRF token is available
 * If no token exists, makes a GET request to the API to get one
 */
export async function ensureCsrfToken(): Promise<string | null> {
  // Check if we already have a CSRF token
  let csrfToken = getCookie("csrf_token")

  if (csrfToken) {
    return csrfToken
  }

  // If no token exists, make a GET request to any API endpoint to get one
  // The CSRF middleware will set a token cookie on GET requests
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    await axios.get(`${apiUrl}/health`, { withCredentials: true })

    // Check again for the token
    csrfToken = getCookie("csrf_token")
    return csrfToken
  } catch (error) {
    console.error("Failed to get CSRF token:", error)
    return null
  }
}
