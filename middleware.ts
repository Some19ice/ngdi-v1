import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PROTECTED_ROUTES } from "./lib/auth/paths"
import * as jose from "jose"
import { UserRole } from "./lib/auth/constants"
import { authClient, validateJwtToken } from "./lib/auth-client"

// Constants
const AUTH_COOKIE_NAME = "auth_token"

// Cache token validation results (TTL of 60 seconds)
const tokenValidationCache = new Map<string, {
  timestamp: number;
  isValid: boolean;
  userId?: string;
  email?: string;
  role?: string;
}>();

// Basic client-side token validation (non-blocking)
function quickValidateToken(token: string) {
  try {
    // Quick format check
    if (!token || !token.includes(".") || token.split(".").length !== 3) {
      return { isValid: false }
    }

    // Decode without verification (fast operation)
    const decoded = jose.decodeJwt(token)

    // Check expiration
    const currentTime = Math.floor(Date.now() / 1000)
    if (decoded.exp && decoded.exp < currentTime) {
      return { isValid: false }
    }

    // Extract basic user information
    const userId =
      typeof decoded.sub === "string"
        ? decoded.sub
        : typeof decoded.userId === "string"
          ? decoded.userId
          : ""

    const email = typeof decoded.email === "string" ? decoded.email : "unknown"
    const role = typeof decoded.role === "string" ? decoded.role : "USER"

    return {
      isValid: !!userId,
      userId,
      email,
      role,
    }
  } catch (e) {
    return { isValid: false }
  }
}

async function hasCompletedOnboarding(userId: string) {
  // Check if user has completed onboarding
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/users/profile`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Don't include auth headers here as we're making this call server-side in middleware
        },
      }
    )

    if (!response.ok) {
      console.log(`Failed to check onboarding status: ${response.status}`)
      // If we can't verify, assume onboarding is completed to prevent loops
      return true
    }

    const userData = await response.json()
    console.log(
      `Onboarding check: user has organization? ${!!userData.organization}`
    )
    return !!userData.organization // Check if organization is set
  } catch (error) {
    console.error("Error checking onboarding status:", error)
    // If there's an error, assume onboarding is completed to prevent loops
    return true
  }
}

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  console.log(`Middleware processing path: ${path}`)

  // Fast path for non-protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )

  // Skip middleware for static assets and API routes
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/images/") ||
    path.startsWith("/fonts/") ||
    path.startsWith("/assets/") ||
    path.startsWith("/api/")
  ) {
    return NextResponse.next()
  }

  // Check if the path is an auth route
  const isAuthRoute = path.startsWith("/auth")

  // For auth routes, allow access regardless of authentication status
  if (isAuthRoute) {
    console.log(`Auth route detected: ${path}, allowing access`)
    // If the user is trying to access an auth route with a valid token,
    // we'll let the client-side logic handle redirection to prevent conflicts
    const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value

    if (authToken && path === "/auth/signin") {
      // For the signin page specifically, perform a quick validation check
      try {
        const quickResult = quickValidateToken(authToken)
        // Add debug headers to help with troubleshooting
        const response = NextResponse.next()
        response.headers.set(
          "x-auth-debug",
          JSON.stringify({
            path,
            hasToken: true,
            quickValidation: quickResult.isValid,
            timestamp: Date.now(),
          })
        )
        return response
      } catch (error) {
        console.error("Error in auth token quick validation:", error)
        // If validation fails, still allow access to signin page
      }
    }

    return NextResponse.next()
  }

  // Special handling for the home page (landing page)
  // Always allow access to home page - app/page.tsx will handle redirect for authenticated users
  if (path === "/" || path === "/home") {
    console.log("Home page - allowing access")
    return NextResponse.next()
  }

  // Only perform token validation for protected routes
  if (isProtectedRoute) {
    // Check if the user is authenticated
    const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value

    // If no token and this is a protected route, redirect to login
    if (!authToken) {
      console.log(
        `Redirecting from protected route ${path} to signin due to missing auth token`
      )
      const redirectUrl = new URL("/auth/signin", request.url)
      redirectUrl.searchParams.set("from", path)
      return NextResponse.redirect(redirectUrl)
    }

    // Check cache first for this token
    const cachedResult = tokenValidationCache.get(authToken)
    if (cachedResult && Date.now() - cachedResult.timestamp < 60000) {
      // 60 second TTL
      // Use cached result
      if (!cachedResult.isValid) {
        // If cached result says token is invalid, redirect to login
        console.log(
          `Redirecting from protected route ${path} to signin due to invalid token (cached)`
        )
        const redirectUrl = new URL("/auth/signin", request.url)
        redirectUrl.searchParams.set("from", path)
        return NextResponse.redirect(redirectUrl)
      }

      // Create response with user headers from cache
      const response = NextResponse.next()
      if (cachedResult.userId) {
        response.headers.set("x-user-id", cachedResult.userId)
        response.headers.set("x-user-email", cachedResult.email || "")
        response.headers.set("x-user-role", cachedResult.role || "USER")
      }

      return response
    }

    // Perform quick client-side validation (synchronous)
    const quickResult = quickValidateToken(authToken)

    // Cache the result
    tokenValidationCache.set(authToken, {
      timestamp: Date.now(),
      isValid: quickResult.isValid,
      userId: quickResult.userId,
      email: quickResult.email,
      role: quickResult.role,
    })

    if (!quickResult.isValid) {
      // If token is invalid, redirect to login
      console.log(
        `Redirecting from protected route ${path} to signin due to invalid token`
      )
      const redirectUrl = new URL("/auth/signin", request.url)
      redirectUrl.searchParams.set("from", path)
      return NextResponse.redirect(redirectUrl)
    }

    // Create response with user headers
    const response = NextResponse.next()
    if (quickResult.userId) {
      response.headers.set("x-user-id", quickResult.userId)
      response.headers.set("x-user-email", quickResult.email || "")
      response.headers.set("x-user-role", quickResult.role || "USER")
    }

    // Check if user is a node officer who hasn't completed onboarding
    if (quickResult.role === UserRole.NODE_OFFICER) {
      // Check if already on new-user page or coming from new-user page to avoid loops
      if (path.startsWith("/auth/new-user")) {
        // Allow access to the new-user page
        return NextResponse.next()
      }

      // Check if the onboarding_complete flag is set in cookies
      const onboardingComplete =
        request.cookies.get("onboarding_complete")?.value === "true"
      if (onboardingComplete) {
        // If flag is set, skip the onboarding check
        return NextResponse.next()
      }

      // Check if the path is for root/home, as these are the likely redirect targets after onboarding
      if (path === "/" || path === "/home") {
        // For root paths, check if actually onboarded
        const hasOnboarded = await hasCompletedOnboarding(quickResult.userId)

        // If not onboarded, redirect to onboarding
        if (!hasOnboarded) {
          console.log("Node officer needs to complete onboarding, redirecting")
          return NextResponse.redirect(new URL("/auth/new-user", request.url))
        }
      }
    }

    return response
  }

  // For non-protected routes that aren't special cases, just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // Match all auth routes
    "/auth/:path*",
    // Match all API routes
    "/api/:path*",
  ],
}
