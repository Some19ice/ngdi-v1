import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"
import { normalizeRole, UserRole, isValidRole } from "./lib/auth/constants"
import { validateJwtToken } from "./lib/auth-client"
import {
  AUTH_PATHS,
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
  NODE_OFFICER_ROUTES,
} from "./lib/auth/paths"

// Import DEBUG_ROUTES from paths and extend it
import { DEBUG_ROUTES as BASE_DEBUG_ROUTES } from "./lib/auth/paths"

// Extended debug routes
const DEBUG_ROUTES = [...BASE_DEBUG_ROUTES, "/auth/debug"]

// Original console.error to save it
const originalConsoleError = console.error

// List of cookies that should not be touched during sign-out
// This helps prevent issues with new authentication attempts
const PROTECTED_COOKIES = [
  "next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "__Host-next-auth.csrf-token",
]

// Override console.error to suppress specific errors
console.error = function (...args) {
  // Check if this is an AuthSessionMissingError we want to silence
  const errorString = args.join(" ")
  if (
    (errorString.includes("AuthSessionMissingError") &&
      errorString.includes("Auth session missing")) ||
    // Also suppress some common auth-related errors that flood logs
    errorString.includes("PKCE state mismatch") ||
    errorString.includes("Failed to fetch user from the backend") ||
    (errorString.includes("Error fetching") &&
      errorString.includes("auth/user"))
  ) {
    // Use debug for development visibility without cluttering error logs
    if (process.env.NODE_ENV === "development") {
      console.debug(
        "Suppressed auth error:",
        errorString.substring(0, 100) + "..."
      )
    }
    return
  }

  // Otherwise, use the original console.error
  originalConsoleError.apply(console, args)
}

// Helper function for enhanced logging
function logAuthInfo(message: string, data: Record<string, any> = {}) {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_AUTH === "true"
  ) {
    console.log(`[Auth] ${message}`, JSON.stringify(data, null, 2))
  }
}

// Helper function to check if a path matches a protected route
function isProtectedRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (pathname === route) return true

    // Subpath match (ensure it's a proper subpath with a trailing slash)
    if (pathname.startsWith(`${route}/`)) return true

    return false
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Skip middleware for debug routes
  if (isProtectedRoute(pathname, DEBUG_ROUTES)) {
    logAuthInfo(
      `[MIDDLEWARE] Path ${pathname} is a debug route, skipping auth check`
    )
    return NextResponse.next()
  }

  logAuthInfo(`[MIDDLEWARE] Processing request for path: ${pathname}`, {
    url: request.url,
    method: request.method,
    cookies: Object.fromEntries(
      request.cookies
        .getAll()
        .map((c) => [c.name, c.value.substring(0, 10) + "..."])
    ),
    headers: Object.fromEntries(
      Array.from(request.headers.entries()).filter(
        ([key]) => !key.includes("authorization")
      ) // Don't log auth headers
    ),
  })

  // Check if the route requires authentication
  const isAdminRoute = isProtectedRoute(pathname, ADMIN_ROUTES)
  const isProtectedPath = isProtectedRoute(pathname, PROTECTED_ROUTES)

  if (isAdminRoute || isProtectedPath) {
    logAuthInfo(
      `[MIDDLEWARE] Path ${pathname} is protected, checking authentication`
    )

    // Check for auth token in Authorization header or cookie
    const authHeader = request.headers.get("authorization")
    const authToken = authHeader
      ? authHeader.replace("Bearer ", "")
      : request.cookies.get("auth_token")?.value

    if (!authToken) {
      logAuthInfo(
        `[MIDDLEWARE] No auth token found for ${pathname}, redirecting to login`
      )

      // Redirect to login with return URL
      const redirectUrl = new URL(AUTH_PATHS.SIGNIN, request.url)
      redirectUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Validate the token
    const validationResult = await validateJwtToken(authToken)

    if (!validationResult.isValid) {
      logAuthInfo(
        `[MIDDLEWARE] Token validation failed: ${validationResult.error}`,
        {
          path: pathname,
          tokenPrefix: authToken.substring(0, 10) + "...",
          validationError: validationResult.error,
          validationResult,
        }
      )

      // Clear the invalid token and redirect to login
      const response = NextResponse.redirect(
        new URL(
          AUTH_PATHS.SIGNIN + `?from=${encodeURIComponent(pathname)}`,
          request.url
        )
      )
      response.cookies.delete("auth_token")
      return response
    }

    // Check role-specific routes
    const userRole = validationResult.role

    // Log user role for debugging
    logAuthInfo(`[MIDDLEWARE] User role for ${pathname}: ${userRole}`, {
      userRole,
      isAdmin: userRole === UserRole.ADMIN,
      isAdminRoute,
    })

    // Check admin routes first
    if (isAdminRoute) {
      if (userRole !== UserRole.ADMIN) {
        logAuthInfo(
          `[MIDDLEWARE] User does not have ADMIN role for ${pathname}`
        )
        return NextResponse.redirect(
          new URL(AUTH_PATHS.UNAUTHORIZED, request.url)
        )
      }
      logAuthInfo(`[MIDDLEWARE] Admin access granted for ${pathname}`)
    }

    // For non-admin protected routes, check node officer access
    if (
      !isAdminRoute &&
      isProtectedRoute(pathname, NODE_OFFICER_ROUTES) &&
      userRole !== UserRole.NODE_OFFICER &&
      userRole !== UserRole.ADMIN
    ) {
      logAuthInfo(
        `[MIDDLEWARE] User does not have required role for ${pathname}`
      )
      return NextResponse.redirect(
        new URL(AUTH_PATHS.UNAUTHORIZED, request.url)
      )
    }

    // User is authenticated and has the required role
    logAuthInfo(`[MIDDLEWARE] User authenticated for ${pathname}`)

    // Clone the request headers and add user info for server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", validationResult.userId || "")
    requestHeaders.set("x-user-role", userRole || UserRole.USER)
    requestHeaders.set("x-user-email", validationResult.email || "")

    // Return the request with the added headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
