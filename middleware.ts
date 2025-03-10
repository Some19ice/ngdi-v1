import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PROTECTED_ROUTES } from "./lib/auth/paths"
import * as jose from "jose"
import { UserRole } from "./lib/auth/constants"

// Helper function to extract user info from token
async function extractUserFromToken(token: string) {
  try {
    // Decode the token without verification for middleware
    const decoded = jose.decodeJwt(token)

    return {
      id: decoded.sub || (decoded.userId as string),
      email: decoded.email as string,
      role: decoded.role as string,
    }
  } catch (error) {
    console.error("Error extracting user from token:", error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  console.log(`Middleware processing path: ${path}`)

  // Check if the path is an auth route
  const isAuthRoute = path.startsWith("/auth")

  // Check if the user is authenticated
  const authToken = request.cookies.get("auth_token")?.value
  const authTokensStr = request.cookies.get("auth_tokens")?.value

  // Get the token to use
  const tokenToUse =
    authToken || (authTokensStr ? JSON.parse(authTokensStr).accessToken : null)

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
    }
  }

  // For auth routes, allow access regardless of authentication status
  if (isAuthRoute) {
    return response
  }

  // For API routes, allow access and let the API handle authentication
  if (path.startsWith("/api")) {
    return response
  }

  // For static assets, allow access
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/images/") ||
    path.startsWith("/fonts/")
  ) {
    return response
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
