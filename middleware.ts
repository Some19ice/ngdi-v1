import { NextResponse, NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/unauthorized",
  "/verify-request",
]

// Protected routes configuration with their allowed roles
const protectedRoutes = [
  {
    path: "/metadata",
    roles: ["ADMIN", "NODE_OFFICER"],
  },
  {
    path: "/admin",
    roles: ["ADMIN"],
  },
  {
    path: "/profile",
    roles: ["USER", "NODE_OFFICER", "ADMIN"],
  },
  {
    path: "/search",
    roles: ["USER", "NODE_OFFICER", "ADMIN"],
  },
  {
    path: "/map",
    roles: ["USER", "NODE_OFFICER", "ADMIN"],
  },
  {
    path: "/news",
    roles: ["USER", "NODE_OFFICER", "ADMIN"],
  },
  {
    path: "/gallery",
    roles: ["USER", "NODE_OFFICER", "ADMIN"],
  },
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  try {
    // Get the token using next-auth/jwt
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // No token, redirect to signin
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if the route is protected
    const matchedRoute = protectedRoutes.find((route) =>
      pathname.startsWith(route.path)
    )

    if (matchedRoute) {
      // Check if user's role is allowed
      const userRole = token.role as string
      if (!matchedRoute.roles.includes(userRole)) {
        console.error(
          `Access denied: User role ${userRole} not allowed for ${pathname}`
        )
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }

    // Add user info to headers for logging/debugging
    const response = NextResponse.next()
    response.headers.set("x-user-id", token.sub as string)
    response.headers.set("x-user-role", token.role as string)

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/auth/error", request.url))
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
