import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "@prisma/client"

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/committee",
  "/publications",
  "/login",
  "/register",
  "/verify-request",
  "/help",
  "/documentation",
  "/feedback",
]

// Define protected routes and their required roles
const protectedRoutes = [
  {
    path: "/metadata/add",
    roles: [UserRole.ADMIN, UserRole.MODERATOR],
  },
  {
    path: "/metadata",
    roles: [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER],
  },
  {
    path: "/profile",
    roles: [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER],
  },
  {
    path: "/settings",
    roles: [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER],
  },
  {
    path: "/admin",
    roles: [UserRole.ADMIN],
  },
]

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Allow public routes and static files
  if (
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/api/public") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (!token) {
    // Don't redirect to login if already on login page
    if (pathname === "/login") {
      return NextResponse.next()
    }

    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", encodeURIComponent(pathname))
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and tries to access login page, redirect to home
  if (pathname === "/login") {
    const redirectUrl = request.nextUrl.searchParams.get("from")
    const destination = redirectUrl ? decodeURIComponent(redirectUrl) : "/"
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Check role-based access for protected routes
  const matchedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  )

  if (matchedRoute) {
    const userRole = token.role as UserRole

    if (!matchedRoute.roles.includes(userRole)) {
      // Redirect to unauthorized page if user doesn't have required role
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
