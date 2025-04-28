import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "./src/lib/auth/constants"
import {
  AUTH_PATHS,
  PROTECTED_ROUTES,
  DEBUG_ROUTES,
  ADMIN_ROUTES,
  NODE_OFFICER_ROUTES,
} from "./src/lib/auth/paths"

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
  return routes.some(route => {
    // Exact match
    if (route === path) return true
    // Route with wildcard (e.g., /admin/*)
    if (route.endsWith('*') && path.startsWith(route.slice(0, -1))) return true
    // Path starts with route and is followed by / or nothing
    if (path.startsWith(route + '/') || path === route) return true
    return false
  })
}

// Helper function to validate JWT token (simplified)
async function validateToken(token: string): Promise<{ isValid: boolean, role?: UserRole }> {
  try {
    // In a real implementation, this would make a request to the API to validate the token
    // For now, we'll just check if the token exists
    if (!token) return { isValid: false }

    // For demo purposes, assume token is valid
    // In production, this would decode the token and verify its signature
    return { isValid: true, role: UserRole.USER }
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
  if (
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/faq" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname.startsWith("/auth/") ||
    pathname === "/unauthorized"
  ) {
    log.debug(`Skipping auth check for public route: ${pathname}`)
    return NextResponse.next()
  }

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
