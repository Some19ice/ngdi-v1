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

export async function middleware(request: NextRequest) {
  console.log('Middleware - Request path:', request.nextUrl.pathname)
  
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  console.log('Middleware - Token present:', !!token)
  if (token) {
    console.log('Middleware - Token role:', token.role)
  }

  const { pathname } = request.nextUrl

  // Enhanced public routes handling
  if (
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/api/public") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public/")
  ) {
    if (pathname === "/login" && token) {
      // Validate return URL before redirecting
      const returnUrl = validateReturnUrl(
        request.nextUrl.searchParams.get("from")
      )
      return NextResponse.redirect(new URL(returnUrl, request.url))
    }
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Enhanced role validation with path matching
  const matchedRoute = protectedRoutes.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
  )

  if (matchedRoute && !matchedRoute.roles.includes(token.role as UserRole)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

// Add URL validation helper
function validateReturnUrl(url: string | null): string {
  try {
    if (!url) return "/"
    const parsed = new URL(url, process.env.NEXTAUTH_URL)
    return parsed.pathname.startsWith("/") ? parsed.pathname : "/"
  } catch {
    return "/"
  }
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
