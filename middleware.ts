import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "@/lib/auth/types"

// Define protected routes and their required roles
const protectedRoutes = [
  {
    path: "/metadata/add",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER],
  },
  {
    path: "/admin",
    roles: [UserRole.ADMIN],
  },
  {
    path: "/profile",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
  },
]

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value

  // Check if the path matches any protected route
  const matchedRoute = protectedRoutes.find((route) =>
    request.nextUrl.pathname.startsWith(route.path)
  )

  if (matchedRoute) {
    if (!session) {
      // Redirect to login if no session exists
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // In a real application, you would verify the session and get user data
      // This is a simplified example
      const userData = JSON.parse(session)

      if (!matchedRoute.roles.includes(userData.role)) {
        // Redirect to 403 page if user doesn't have required role
        return NextResponse.redirect(new URL("/403", request.url))
      }
    } catch (error) {
      // If session is invalid, redirect to login
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/metadata/:path*", "/admin/:path*", "/profile/:path*"],
}
