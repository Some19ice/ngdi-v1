import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "@prisma/client"
import { redis } from "@/lib/redis"
import { Redis } from "@upstash/redis"

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/committee",
  "/publications",
  "/auth/signin",
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
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER],
  },
  {
    path: "/metadata",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
  },
  {
    path: "/profile",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
  },
  {
    path: "/settings",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
  },
  {
    path: "/admin",
    roles: [UserRole.ADMIN],
  },
  {
    path: "/search",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
  },
  {
    path: "/map",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
  },
  {
    path: "/news",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
  },
  {
    path: "/gallery",
    roles: [UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER],
  },
]

// Add helper function to check role access
function hasRequiredRole(token: any, pathname: string): boolean {
  const matchedRoute = protectedRoutes.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
  )

  if (!matchedRoute) return true // Not a protected route
  return matchedRoute.roles.includes(token.role as UserRole)
}

// Update validateReturnUrl to handle special cases
function validateReturnUrl(url: string | null, token: any): string {
  if (!url) return "/metadata"

  try {
    // Decode first before checking
    const decodedUrl = decodeURIComponent(url)

    // Clean and validate the URL
    const cleanUrl = decodedUrl.replace(/^\/+|\/+$/g, "")
    const pathname = cleanUrl ? `/${cleanUrl}` : "/metadata"

    // Ensure the URL is relative and doesn't contain protocol/domain
    if (pathname.includes("://") || pathname.startsWith("//")) {
      return "/metadata"
    }

    // Don't redirect to public routes or auth routes
    if (publicRoutes.includes(pathname) || pathname.startsWith("/auth/")) {
      return "/metadata"
    }

    // Check role access for protected routes
    const matchedRoute = protectedRoutes.find((route) =>
      pathname.startsWith(route.path)
    )

    // If it's a protected route, check permissions
    if (matchedRoute) {
      if (
        !token?.role ||
        !matchedRoute.roles.includes(token.role as UserRole)
      ) {
        return "/metadata"
      }
      return pathname
    }

    // For non-protected routes, ensure they're valid app routes
    // This helps prevent open redirect vulnerabilities
    const isValidRoute = pathname.startsWith("/") && !pathname.includes("..")
    return isValidRoute ? pathname : "/metadata"
  } catch {
    return "/metadata"
  }
}

// Initialize Redis client
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS || "60")
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || "60") // in seconds

async function rateLimit(request: NextRequest) {
  const ip = request.ip || "anonymous"
  const key = `rate-limit:${ip}`

  const current = (await redisClient.get<number>(key)) || 0

  if (current > RATE_LIMIT_REQUESTS) {
    return false
  }

  await redisClient.pipeline().incr(key).expire(key, RATE_LIMIT_WINDOW).exec()

  return true
}

const MAX_REQUESTS_WITHOUT_REDIS = 50 // Higher limit when Redis is unavailable

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    })

    const { pathname } = request.nextUrl

    // Handle signin page for authenticated users first
    if (pathname === "/auth/signin" && token) {
      const returnUrl = validateReturnUrl(
        request.nextUrl.searchParams.get("from"),
        token
      )
      return NextResponse.redirect(new URL(returnUrl, process.env.NEXTAUTH_URL))
    }

    // Handle static and public assets
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/public/") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next()
    }

    // Handle public routes
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Handle authentication
    if (!token) {
      const loginUrl = new URL("/auth/signin", process.env.NEXTAUTH_URL)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Handle authorization
    const matchedRoute = protectedRoutes.find((route) =>
      pathname.startsWith(route.path)
    )

    if (matchedRoute && !matchedRoute.roles.includes(token.role as UserRole)) {
      return NextResponse.redirect(
        new URL("/unauthorized", process.env.NEXTAUTH_URL)
      )
    }

    // Skip rate limiting for non-API routes
    if (!pathname.startsWith("/api")) {
      return NextResponse.next()
    }

    const allowed = await rateLimit(request)

    if (!allowed) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": RATE_LIMIT_WINDOW.toString(),
        },
      })
    }

    // CORS headers
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
    console.error("Middleware error:", error)
    // In case of any errors, redirect to error page
    return NextResponse.redirect(
      new URL("/auth/error", process.env.NEXTAUTH_URL)
    )
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/:path*",
  ],
}
