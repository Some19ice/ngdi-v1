import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "./src/lib/auth/constants"
import AUTH_CONFIG from "./src/lib/auth/auth-config"

// Destructure for easier access
const {
  PATHS: AUTH_PATHS,
  ROUTES: {
    PROTECTED_ROUTES,
    DEBUG_ROUTES,
    ADMIN_ROUTES,
    NODE_OFFICER_ROUTES,
    PUBLIC_ROUTES,
  },
} = AUTH_CONFIG

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

// Helper function to check if a path matches any of the routes in the array
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (route === path) return true
    // Route with wildcard (e.g., /admin/*)
    if (route.endsWith("*") && path.startsWith(route.slice(0, -1))) return true
    // Path starts with route and is followed by / or nothing
    if (path.startsWith(route + "/") || path === route) return true
    return false
  })
}

/**
 * Validates a JWT token by making a request to the API
 * @param token The JWT token to validate
 * @returns An object with isValid and role properties
 */
async function validateToken(
  token: string
): Promise<{ isValid: boolean; role?: UserRole; userId?: string }> {
  try {
    if (!token) return { isValid: false }

    // Make a request to the API to validate the token
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const response = await fetch(`${apiUrl}/api/auth/validate-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    })

    if (!response.ok) {
      log.debug(`Token validation failed with status: ${response.status}`)
      return { isValid: false }
    }

    const data = await response.json()
    return {
      isValid: data.isValid,
      role: data.role as UserRole,
      userId: data.userId,
    }
  } catch (error) {
    log.error("Token validation error:", error)
    return { isValid: false }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Skip middleware for debug routes in development
  if (
    process.env.NODE_ENV === "development" &&
    matchesRoute(pathname, DEBUG_ROUTES)
  ) {
    log.debug(`Skipping auth check for debug route: ${pathname}`)
    return NextResponse.next()
  }

  // Skip middleware for public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES) || pathname.startsWith("/auth/")) {
    log.debug(`Skipping auth check for public route: ${pathname}`)
    return NextResponse.next()
  }

  // Create the response
  const response = NextResponse.next()

  try {
    // Try to get auth token from the configured cookie name
    const { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_KEY, AUTHENTICATED_COOKIE } =
      AUTH_CONFIG.TOKEN
    let authToken = null

    // First check the cookie
    const tokenFromCookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
    if (tokenFromCookie) {
      authToken = tokenFromCookie
      log.debug(`Auth token found in cookie: ${ACCESS_TOKEN_COOKIE}`)
    }

    // Check for authenticated flag
    const authenticated = request.cookies.get(AUTHENTICATED_COOKIE)?.value

    // Check if we have an Authorization header
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

      // Check if this is a protected route that requires authentication
      if (
        matchesRoute(pathname, PROTECTED_ROUTES) ||
        matchesRoute(pathname, ADMIN_ROUTES) ||
        matchesRoute(pathname, NODE_OFFICER_ROUTES)
      ) {
        // Validate the token
        const { isValid, role } = await validateToken(authToken)

        if (!isValid) {
          log.info(
            `Redirecting unauthenticated user from protected route: ${pathname}`
          )
          return NextResponse.redirect(new URL(AUTH_PATHS.SIGNIN, request.url))
        }

        // Check role-based access for admin routes
        if (matchesRoute(pathname, ADMIN_ROUTES) && role !== UserRole.ADMIN) {
          log.info(`Redirecting non-admin user from admin route: ${pathname}`)
          return NextResponse.redirect(
            new URL(AUTH_PATHS.UNAUTHORIZED, request.url)
          )
        }

        // Check role-based access for node officer routes
        if (
          matchesRoute(pathname, NODE_OFFICER_ROUTES) &&
          role !== UserRole.NODE_OFFICER &&
          role !== UserRole.ADMIN
        ) {
          log.info(
            `Redirecting user without node officer role from route: ${pathname}`
          )
          return NextResponse.redirect(
            new URL(AUTH_PATHS.UNAUTHORIZED, request.url)
          )
        }
      }
    } else {
      // No token found in cookies or headers
      log.debug("No auth token found in cookies or headers")

      // Check if this is a protected route that requires authentication
      if (
        matchesRoute(pathname, PROTECTED_ROUTES) ||
        matchesRoute(pathname, ADMIN_ROUTES) ||
        matchesRoute(pathname, NODE_OFFICER_ROUTES)
      ) {
        log.info(
          `Redirecting unauthenticated user from protected route: ${pathname}`
        )
        return NextResponse.redirect(new URL(AUTH_PATHS.SIGNIN, request.url))
      }

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
