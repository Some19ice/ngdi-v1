import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PROTECTED_ROUTES } from "./lib/auth/paths"
import * as jose from "jose"
import { UserRole } from "./lib/auth/constants"
import { authClient, validateJwtToken } from "./lib/auth-client"

// Constants
const AUTH_COOKIE_NAME = "auth_token"

// Safely parse JSON
function safeJsonParse(str: string | null) {
  if (!str) return null
  try {
    return JSON.parse(str)
  } catch (e) {
    console.error("Error parsing JSON:", e)
    return null
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

  // Check if the path is an auth route
  const isAuthRoute = path.startsWith("/auth")

  // For auth routes, allow access regardless of authentication status
  if (isAuthRoute) {
    console.log(`Auth route detected: ${path}, allowing access`)
    return NextResponse.next()
  }

  // For API routes, allow access and let the API handle authentication
  if (path.startsWith("/api")) {
    return NextResponse.next()
  }

  // For static assets, allow access
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/images/") ||
    path.startsWith("/fonts/") ||
    path.startsWith("/assets/")
  ) {
    return NextResponse.next()
  }

  // Check if the user is authenticated
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value

  // Log token status
  console.log(`Token status for ${path}: `, {
    hasAuthToken: !!authToken,
    tokenLength: authToken ? authToken.length : 0,
    cookies: request.cookies
      .getAll()
      .map((c) => ({
        name: c.name,
        value: c.value ? c.value.substring(0, 5) + "..." : "none",
      })),
    isAuthRoute,
    isProtectedRoute: PROTECTED_ROUTES.some(
      (route) => path === route || path.startsWith(`${route}/`)
    ),
  })

  // Create a response object that we'll modify
  let response = NextResponse.next()

  // If we have a token, try to decode it and set user headers
  if (authToken && authToken.split(".").length === 3) {
    try {
      // Decode the token without verification
      const decoded = jose.decodeJwt(authToken)

      // Extract user information
      const userId =
        typeof decoded.sub === "string"
          ? decoded.sub
          : typeof decoded.userId === "string"
            ? decoded.userId
            : ""

      const email =
        typeof decoded.email === "string" ? decoded.email : "unknown"
      const role = typeof decoded.role === "string" ? decoded.role : "USER"

      if (userId) {
        console.log(`Setting user headers for ${path}:`, {
          userId,
          email,
          role,
        })
        response.headers.set("x-user-id", userId)
        response.headers.set("x-user-email", email)
        response.headers.set("x-user-role", role)
      } else {
        console.log(`Token missing user ID for ${path}`)
      }

      // Check if user is a node officer who hasn't completed onboarding
      const tokenData = await validateJwtToken(authToken)
      if (tokenData.isValid && role === UserRole.NODE_OFFICER) {
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
          const hasOnboarded = await hasCompletedOnboarding(userId)

          // If not onboarded, redirect to onboarding
          if (!hasOnboarded) {
            console.log(
              "Node officer needs to complete onboarding, redirecting"
            )
            return NextResponse.redirect(new URL("/auth/new-user", request.url))
          }
        }
      }
    } catch (error) {
      console.error(`Error decoding token for ${path}:`, error)
    }
  } else if (authToken) {
    console.log(`Invalid token format for ${path}`)
  }

  // Check if the current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )

  // For protected routes, check if the user is authenticated
  if (isProtectedRoute && !authToken) {
    console.log(
      `Redirecting from protected route ${path} to signin due to missing auth token`
    )
    // If not authenticated and trying to access a protected route, redirect to signin
    const redirectUrl = new URL("/auth/signin", request.url)
    redirectUrl.searchParams.set("from", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Continue to the requested page
  return response
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
