import { NextResponse, NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { UserRole } from "@/lib/auth/types"

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/unauthorized",
  "/verify-request",
]

// Protected routes configuration
const protectedRoutes = [
  {
    path: "/metadata",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER],
  },
  {
    path: "/admin",
    roles: [UserRole.ADMIN],
  },
  {
    path: "/profile",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
  {
    path: "/search",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
  {
    path: "/map",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
  {
    path: "/news",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
  {
    path: "/gallery",
    roles: [UserRole.USER, UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
]

interface JWTPayload {
  role: UserRole
  [key: string]: unknown
}

function validateReturnUrl(
  returnUrl: string | null,
  token: JWTPayload
): string {
  // Get default URL based on user role
  const getDefaultUrl = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "/admin"
      case UserRole.NODE_OFFICER:
        return "/metadata"
      default:
        return "/"
    }
  }

  // Default to role-based URL if no return URL
  if (!returnUrl) {
    return getDefaultUrl(token.role)
  }

  try {
    const url = new URL(returnUrl, "http://dummy.com")
    const path = url.pathname + url.search

    if (!path.startsWith("/")) {
      return getDefaultUrl(token.role)
    }

    const matchedRoute = protectedRoutes.find((route) =>
      path.startsWith(route.path)
    )

    if (matchedRoute && !matchedRoute.roles.includes(token.role)) {
      return getDefaultUrl(token.role)
    }

    return path
  } catch (error) {
    // If URL parsing fails, return role-based default
    return getDefaultUrl(token.role)
  }
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname, searchParams } = request.nextUrl
    const from = searchParams.get("from")

    // Handle static and public assets
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/public") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next()
    }

    // Handle public routes
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Get the token from the cookie
    const token = request.cookies.get("next-auth.session-token")?.value

    if (!token) {
      const loginUrl = new URL("/auth/signin", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // Verify the JWT token
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
      const { payload } = await jwtVerify(token, secret)
      const jwtPayload = payload as JWTPayload

      // Ensure role exists
      if (!jwtPayload.role) {
        console.error("No role found in token:", jwtPayload)
        const loginUrl = new URL("/auth/signin", request.url)
        loginUrl.searchParams.set("from", pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Handle signin page for authenticated users
      if (pathname === "/auth/signin") {
        const decodedFrom = from ? decodeURIComponent(from) : null
        const returnUrl = validateReturnUrl(decodedFrom, jwtPayload)
        const redirectUrl = new URL(returnUrl, request.url)
        return NextResponse.redirect(redirectUrl)
      }

      // Handle authorization
      const matchedRoute = protectedRoutes.find((route) =>
        pathname.startsWith(route.path)
      )

      if (matchedRoute && !matchedRoute.roles.includes(jwtPayload.role)) {
        console.error(
          `Access denied: User role ${jwtPayload.role} not allowed for ${pathname}`
        )
        const unauthorizedUrl = new URL("/unauthorized", request.url)
        return NextResponse.redirect(unauthorizedUrl)
      }

      // Add CORS headers
      const response = NextResponse.next()
      response.headers.set(
        "Access-Control-Allow-Origin",
        process.env.NEXTAUTH_URL || "*"
      )
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      )
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      )
      response.headers.set("Access-Control-Max-Age", "86400")

      return response
    } catch (error) {
      console.error("Token verification failed:", error)
      // If token verification fails, redirect to login
      const loginUrl = new URL("/auth/signin", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  } catch (error) {
    console.error("Middleware error:", error)
    const errorUrl = new URL("/auth/error", request.url)
    return NextResponse.redirect(errorUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
