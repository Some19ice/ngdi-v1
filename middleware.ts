import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is an auth route
  const isAuthRoute = path.startsWith("/auth")

  // Check if the user is authenticated
  const authToken = request.cookies.get("auth_token")?.value

  // For auth routes, allow access regardless of authentication status
  if (isAuthRoute) {
    return NextResponse.next()
  }

  // For API routes, allow access and let the API handle authentication
  if (path.startsWith("/api")) {
    return NextResponse.next()
  }

  // For protected routes, check if the user is authenticated
  if (
    !authToken &&
    !path.startsWith("/_next") &&
    !path.startsWith("/favicon.ico")
  ) {
    // If not authenticated and trying to access a protected route, redirect to signin
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  // Continue to the requested page
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
