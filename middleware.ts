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
  "/unauthorized",
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

// Add helper function to check role access
function hasRequiredRole(token: any, pathname: string): boolean {
  const matchedRoute = protectedRoutes.find(
    route => pathname === route.path || pathname.startsWith(`${route.path}/`)
  )
  
  if (!matchedRoute) return true // Not a protected route
  return matchedRoute.roles.includes(token.role as UserRole)
}

// Update validateReturnUrl to check role access
function validateReturnUrl(url: string | null, token: any): string {
  try {
    if (!url) return "/"
    const pathname = url.startsWith("/") ? url : `/${url}`
    
    // Check if user has access to the requested URL
    if (token && !hasRequiredRole(token, pathname)) {
      return "/" // Redirect to home if user doesn't have access
    }
    
    return pathname
  } catch {
    return "/"
  }
}

export async function middleware(request: NextRequest) {
  // Add production-specific logging
  const isProduction = process.env.NODE_ENV === 'production'
  console.log('Environment:', process.env.NODE_ENV)
  
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: true // Force secure cookie handling
  })

  // Debug logging
  console.log('Token exists:', !!token)
  console.log('Request path:', request.nextUrl.pathname)
  if (token) {
    console.log('Token role:', token.role)
  }

  const { pathname } = request.nextUrl

  // Handle public routes first
  if (publicRoutes.includes(pathname) ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/") ||
      pathname === "/favicon.ico") {
    
    // Special handling for login
    if (pathname === "/login" && token) {
      const returnUrl = validateReturnUrl(
        request.nextUrl.searchParams.get("from"),
        token
      )
      // Use 307 temporary redirect to preserve the request method
      return NextResponse.redirect(new URL(returnUrl, request.url), { status: 307 })
    }
    return NextResponse.next()
  }

  // Authentication check
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    // Use 307 temporary redirect
    return NextResponse.redirect(loginUrl, { status: 307 })
  }

  // Authorization check
  if (!hasRequiredRole(token, pathname)) {
    // Use 307 temporary redirect
    return NextResponse.redirect(new URL("/unauthorized", request.url), { status: 307 })
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
