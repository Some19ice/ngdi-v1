import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "@prisma/client"
import { redis } from "@/lib/redis"

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

const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs for auth endpoints
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
    let from = request.nextUrl.searchParams.get("from") || request.nextUrl.pathname
    
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
  const matchedRoute = protectedRoutes.find(
    route => pathname.startsWith(route.path)
  )

  if (matchedRoute && !matchedRoute.roles.includes(token.role as UserRole)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // Update rate limiting section
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    try {
      const ip = request.ip ?? "127.0.0.1"
      const rateLimitKey = `rate-limit:${ip}`
      
      const currentRequests = await redis.incr(rateLimitKey)
      if (currentRequests === 1) {
        await redis.expire(rateLimitKey, rateLimit.windowMs / 1000)
      }

      const remaining = Math.max(0, rateLimit.max - currentRequests)

      if (currentRequests > rateLimit.max) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.windowMs / 1000),
            "X-RateLimit-Limit": String(rateLimit.max),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + rateLimit.windowMs / 1000),
          },
        })
      }

      const response = NextResponse.next()
      response.headers.set("X-RateLimit-Limit", String(rateLimit.max))
      response.headers.set("X-RateLimit-Remaining", String(remaining))
      return response
    } catch (error) {
      console.error("Rate limiting error:", error)
      // Use in-memory fallback when Redis is unavailable
      const response = NextResponse.next()
      response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS_WITHOUT_REDIS))
      response.headers.set("X-RateLimit-Remaining", String(MAX_REQUESTS_WITHOUT_REDIS - 1))
      return response
    }
  }

  // Add security headers
  const headers = new Headers(request.headers)
  
  // Content Security Policy
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )

  // Other security headers
  headers.set("X-DNS-Prefetch-Control", "on")
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  headers.set("X-Frame-Options", "SAMEORIGIN")
  headers.set("X-Content-Type-Options", "nosniff")
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  const response = NextResponse.next({
    request: {
      headers,
    },
  })

  // Add security headers for auth routes
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    const headers = new Headers(request.headers)
    headers.set("X-Frame-Options", "DENY")
    headers.set("X-Content-Type-Options", "nosniff")
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    headers.set("X-XSS-Protection", "1; mode=block")
    
    const response = NextResponse.next({
      request: {
        headers,
      },
    })
    
    return response
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/:path*",
  ],
}
