import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "./src/lib/auth/constants"

// Set up logging
const enableDebug =
  process.env.DEBUG === "true" || process.env.DEBUG_AUTH === "true"
const log = {
  info: (message: string, ...args: any[]) =>
    console.log(`[Middleware] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => {
    if (enableDebug) console.log(`[Middleware Debug] ${message}`, ...args)
  },
  error: (message: string, ...args: any[]) =>
    console.error(`[Middleware Error] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[Middleware Warning] ${message}`, ...args),
}

export async function middleware(request: NextRequest) {
  // Create the response
  const response = NextResponse.next()

  try {
    // Try to get auth token from various cookie names
    const cookieNames = ["auth_token", "accessToken", "token"]
    let authToken = null

    for (const name of cookieNames) {
      const token = request.cookies.get(name)?.value
      if (token) {
        authToken = token
        log.debug(`Auth token found in cookie: ${name}`)
        break
      }
    }

    // Also check for authenticated flag
    const authenticated = request.cookies.get("authenticated")?.value

    // Check if we have an Authorization header already
    const authHeader = request.headers.get("Authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Use the token from the header
      authToken = authHeader.split(" ")[1]
      log.debug("Auth token found in Authorization header")
    }

    if (authToken) {
      // Pass the token to the API through headers
      response.headers.set("Authorization", `Bearer ${authToken}`)
      log.debug("Setting Authorization header with token")
    } else {
      // No token found in cookies or headers
      log.debug("No auth token found in cookies or headers")

      // Add a response header to trigger client-side token check
      response.headers.set("X-Check-Auth", "true")

      // Set a header attribute on the HTML document to trigger the client-side check
      response.headers.set(
        "Set-Cookie",
        "x-check-auth=true; Path=/; Max-Age=60; HttpOnly=false",
        { append: true }
      )
    }
  } catch (error) {
    log.error("Error in middleware:", error)
  }

  return response
}

export const config = {
  matcher: [
    // Skip all static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
