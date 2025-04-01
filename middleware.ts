import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PROTECTED_ROUTES } from "./lib/auth/paths"
import { UserRole } from "./lib/auth/constants"
import { authClient } from "./lib/auth-client"

// Constants
const AUTH_COOKIE_NAME = "auth_token"

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
        const validationResult = await authClient.validateToken(authToken)
        // Add debug headers to help with troubleshooting
        const response = NextResponse.next()
        response.headers.set(
          "x-auth-debug",
          JSON.stringify({
            path,
            hasToken: true,
            quickValidation: validationResult.isValid,
            timestamp: Date.now(),
          })
        )
        return response
      } catch (error) {
        console.error("Error in auth token validation:", error)
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

    // Validate the token using our client-side validation
    const validationResult = await authClient.validateToken(authToken)
    
    if (!validationResult.isValid) {
      // If token is invalid, redirect to login
      console.log(
        `Redirecting from protected route ${path} to signin due to invalid token: ${validationResult.error}`
      )
      const redirectUrl = new URL("/auth/signin", request.url)
      redirectUrl.searchParams.set("from", path)
      return NextResponse.redirect(redirectUrl)
    }

    // Create response with user headers
    const response = NextResponse.next()
    if (validationResult.userId) {
      response.headers.set("x-user-id", validationResult.userId)
      response.headers.set("x-user-email", validationResult.email || "")
      response.headers.set("x-user-role", validationResult.role || "USER")
    }

    // Handle node officer onboarding check with userId null check
    if (validationResult.role === UserRole.NODE_OFFICER) {
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
        return response
      }

      // Check if the path is for root/home, as these are the likely redirect targets after onboarding
      if (path === "/" || path === "/home") {
        // For root paths, check if actually onboarded
        if (validationResult.userId) {
          const hasOnboarded = await hasCompletedOnboarding(validationResult.userId)

          // If not onboarded, redirect to onboarding
          if (!hasOnboarded) {
            console.log("Node officer needs to complete onboarding, redirecting")
            return NextResponse.redirect(new URL("/auth/new-user", request.url))
          }
        } else {
          // If we don't have a userId, redirect to login
          console.log("Missing userId for node officer, redirecting to login")
          return NextResponse.redirect(new URL("/auth/signin", request.url))
        }
      }
    }

    return response
  }

  // For non-protected routes, just continue
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
