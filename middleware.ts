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

// Simple in-memory rate limiter
const ratelimits = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_DURATION = 10 * 1000 // 10 seconds
const MAX_REQUESTS = 10 // 10 requests per duration

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ratelimits.get(ip)

  // Clean up expired records
  if (record && now > record.resetTime) {
    ratelimits.delete(ip)
  }

  if (!record || now > record.resetTime) {
    // First request or reset period
    ratelimits.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_DURATION,
    })
    return true
  }

  if (record.count >= MAX_REQUESTS) {
    return false
  }

  // Increment counter
  record.count++
  return true
}

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

  const ip = request.ip ?? "127.0.0.1"

  // Rate limiting only for auth endpoints
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    if (!checkRateLimit(ip)) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": "10",
        },
      })
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

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/:path*",
  ],
}
