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
]

// Add helper function to check role access
function hasRequiredRole(token: any, pathname: string): boolean {
  const matchedRoute = protectedRoutes.find(
    route => pathname === route.path || pathname.startsWith(`${route.path}/`)
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
    
    // Handle legacy login paths and encoded slashes
    if (decodedUrl.startsWith("/login") || decodedUrl === "%2Flogin") {
      return "/metadata"
    }

    // Clean and validate the URL
    const cleanUrl = decodedUrl.replace(/^\/+|\/+$/g, '')
    const pathname = cleanUrl ? `/${cleanUrl}` : "/metadata"
    
    // Additional validation for non-existent paths
    const isValidPath = protectedRoutes.some(route => 
      pathname.startsWith(route.path) || publicRoutes.includes(pathname)
    )

    if (!isValidPath) return "/metadata"

    // Check role access
    if (token && !hasRequiredRole(token, pathname)) {
      return "/metadata"
    }
    
    return pathname
  } catch {
    return "/metadata"
  }
}

// Initialize Redis client
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS || '60')
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60') // in seconds

async function rateLimit(request: NextRequest) {
  const ip = request.ip || 'anonymous'
  const key = `rate-limit:${ip}`

  const current = await redisClient.get<number>(key) || 0
  
  if (current > RATE_LIMIT_REQUESTS) {
    return false
  }

  await redisClient.pipeline()
    .incr(key)
    .expire(key, RATE_LIMIT_WINDOW)
    .exec()

  return true
}

const MAX_REQUESTS_WITHOUT_REDIS = 50 // Higher limit when Redis is unavailable

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // More specific API route handling
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/public/") ||
    pathname === "/favicon.ico" ||
    publicRoutes.includes(pathname)
  ) {
    // Handle login page for authenticated users
    if (pathname === "/auth/signin" && token) {
      const returnUrl = validateReturnUrl(
        request.nextUrl.searchParams.get("from"),
        token
      )
      return NextResponse.redirect(new URL(returnUrl, request.url))
    }
    return NextResponse.next()
  }

  // Handle authentication
  if (!token) {
    const loginUrl = new URL("/auth/signin", request.url)
    let from =
      request.nextUrl.searchParams.get("from") || request.nextUrl.pathname

    // Sanitize from parameter
    if (from === "/login" || from === "%2Flogin") {
      from = "/metadata"
    }

    if (!publicRoutes.includes(from) && from !== "/metadata") {
      loginUrl.searchParams.set("from", from)
    }

    return NextResponse.redirect(loginUrl)
  }

  // Handle authorization
  const matchedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  )

  if (matchedRoute && !matchedRoute.roles.includes(token.role as UserRole)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
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
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/:path*",
  ],
}
