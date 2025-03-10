import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PROTECTED_ROUTES } from "./lib/auth/paths"
import * as jose from "jose"
import { UserRole } from "./lib/auth/constants"

// Helper function to extract user info from token
async function extractUserFromToken(token: string) {
  try {
    // Check if token is valid before attempting to decode
    if (!token || token.trim() === "") {
      console.log("Empty token provided to extractUserFromToken")
      return null
    }

    // Check if token has the correct format (at least has two dots for JWT)
    if (!token.includes(".")) {
      console.log(
        "Invalid token format (not a JWT):",
        token.substring(0, 10) + "..."
      )
      return null
    }

    // Decode the token without verification for middleware
    try {
      const decoded = jose.decodeJwt(token)

      // Validate that the decoded token has the required fields
      if (!decoded || (!decoded.sub && !decoded.userId)) {
        console.log("Token missing required fields (sub or userId)")
        return null
      }

      return {
        id: decoded.sub || (decoded.userId as string),
        email: (decoded.email as string) || "unknown",
        role: (decoded.role as string) || "USER",
      }
    } catch (jwtError) {
      console.error("JWT decode error:", jwtError)
      return null
    }
  } catch (error) {
    console.error("Error extracting user from token:", error)
    return null
  }
}

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
  const authToken = request.cookies.get("auth_token")?.value
  const authTokensStr = request.cookies.get("auth_tokens")?.value

  // Get the token to use
  let tokenToUse = authToken
  if (!tokenToUse && authTokensStr) {
    try {
      const parsedTokens = safeJsonParse(authTokensStr)
      tokenToUse = parsedTokens?.accessToken

      // Validate token format
      if (
        tokenToUse &&
        (!tokenToUse.includes(".") || tokenToUse.trim() === "")
      ) {
        console.log("Invalid token format from auth_tokens cookie, ignoring")
        tokenToUse = null
      }
    } catch (error) {
      console.error("Error parsing auth_tokens:", error)
      tokenToUse = null
    }
  }

  // Log token status with more details
  console.log(`Token status for ${path}: `, {
    hasAuthToken: !!authToken,
    authTokenLength: authToken ? authToken.length : 0,
    hasAuthTokensStr: !!authTokensStr,
    hasTokenToUse: !!tokenToUse,
    tokenFormat: tokenToUse
      ? tokenToUse.includes(".")
        ? "JWT"
        : "Invalid"
      : "None",
  })

  // Create a response object that we'll modify
  let response = NextResponse.next()

  // If we have a token, extract user info and set headers
  if (tokenToUse) {
    const user = await extractUserFromToken(tokenToUse)
    if (user) {
      console.log(`Setting user headers for ${path}:`, user)
      response.headers.set("x-user-id", user.id)
      response.headers.set("x-user-email", user.email)
      response.headers.set("x-user-role", user.role)
    } else {
      console.log(`Failed to extract user from token for ${path}`)
    }
  }

  // Check if the current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )

  // For protected routes, check if the user is authenticated
  if (isProtectedRoute && !tokenToUse) {
    console.log(
      `Redirecting from protected route ${path} to signin due to missing auth token`
    )
    // If not authenticated and trying to access a protected route, redirect to signin
    return NextResponse.redirect(new URL("/auth/signin", request.url))
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
