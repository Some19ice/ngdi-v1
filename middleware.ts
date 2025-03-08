import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { withAuth } from "next-auth/middleware"

// Original console.error to save it
const originalConsoleError = console.error

// Define known auth paths for better path management
const AUTH_PATHS = {
  SIGNIN: "/auth/signin",
  SIGNOUT: "/api/auth/signout",
  CALLBACK: "/auth/callback",
  RESET_PASSWORD: "/auth/reset-password",
  NEW_USER: "/auth/new-user",
}

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

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({
      req: request,
      res: NextResponse.next(),
    })

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Middleware - Error getting session:", error)
    }

    // If we have a session but it's expired, try to refresh it
    if (
      session?.expires_at &&
      session.expires_at <= Math.floor(Date.now() / 1000)
    ) {
      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.refreshSession()

      if (refreshError) {
        console.error("Middleware - Error refreshing session:", refreshError)
      } else if (refreshedSession) {
        console.log("Middleware - Session refreshed successfully")
      }
    }

    // Get the pathname from the request
    const path = request.nextUrl.pathname

    // Define protected routes that require authentication
    const protectedRoutes = [
      "/dashboard",
      "/profile",
      "/settings",
      "/api/user/",
      "/api/protected/",
    ]

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
      path.startsWith(route)
    )

    // If it's a protected route and there's no session, redirect to login
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/auth/signin", request.url)
      redirectUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(redirectUrl)
    }

    // Continue with the request
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware - Unexpected error:", error)
    return NextResponse.next()
  }
}

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Configure which routes use this middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/api/protected/:path*",
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
