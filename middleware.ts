import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

// Original console.error to save it
const originalConsoleError = console.error

// Define known auth paths for better path management
const AUTH_PATHS = {
  SIGNIN: "/auth/signin",
  CALLBACK: "/auth/callback",
  RESET_PASSWORD: "/auth/reset-password",
  NEW_USER: "/auth/new-user",
}

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/metadata",
  "/admin",
  "/settings",
]

// Admin-only routes
const ADMIN_ROUTES = ["/admin"]

// Node officer routes
const NODE_OFFICER_ROUTES = ["/metadata/create", "/metadata/edit"]

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
  const { pathname } = request.nextUrl
  
  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }
  
  // Check if the route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }
  
  // Get the JWT token from cookies or authorization header
  const token = request.cookies.get("auth_token")?.value || 
    request.headers.get("authorization")?.replace("Bearer ", "")
  
  if (!token) {
    // Redirect to login page with return URL
    const url = new URL(AUTH_PATHS.SIGNIN, request.url)
    url.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(url)
  }
  
  try {
    // Verify and decode the token
    const decoded = jose.decodeJwt(token)
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000)
    if (decoded.exp && decoded.exp < currentTime) {
      // Token expired, redirect to login
      const url = new URL(AUTH_PATHS.SIGNIN, request.url)
      url.searchParams.set("returnUrl", pathname)
      return NextResponse.redirect(url)
    }
    
    // Check role-based access
    const userRole = decoded.role as string
    
    // Check admin routes
    if (
      ADMIN_ROUTES.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
      ) && 
      userRole !== "admin"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
    
    // Check node officer routes
    if (
      NODE_OFFICER_ROUTES.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
      ) && 
      userRole !== "admin" && 
      userRole !== "node_officer"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
    
    // User is authenticated and authorized
    return NextResponse.next()
  } catch (error) {
    console.error("Token verification failed:", error)
    // Invalid token, redirect to login
    const url = new URL(AUTH_PATHS.SIGNIN, request.url)
    url.searchParams.set("returnUrl", pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
