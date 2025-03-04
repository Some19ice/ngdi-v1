import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authOptions } from "./auth-options"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"
import { headers } from "next/headers"
import { MockRedis } from "@/lib/redis"

// Initialize Redis for rate limiting
const redis =
  process.env.NODE_ENV === "test"
    ? new MockRedis()
    : new Redis({
        url: process.env.UPSTASH_REDIS_URL!,
        token: process.env.UPSTASH_REDIS_TOKEN!,
      })

// Create rate limiter with test-specific configuration
const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    process.env.NODE_ENV === "test"
      ? 100
      : AUTH_CONFIG.security.rateLimiting.maxAttempts,
    process.env.NODE_ENV === "test"
      ? "1 h"
      : `${AUTH_CONFIG.security.rateLimiting.windowMs}ms`
  ),
})

async function getRateLimitInfo(identifier: string) {
  const headersList = headers()
  const ip = headersList.get("x-real-ip") || "127.0.0.1"
  const key = `${identifier}:${ip}`

  try {
    const { success, limit, remaining, reset } = await limiter.limit(key)
    return { success, limit, remaining, reset }
  } catch (error) {
    console.error("Rate limit check failed:", error)
    // In test mode, always allow requests if rate limit check fails
    if (process.env.NODE_ENV === "test") {
      return {
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 3600000,
      }
    }
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}

const handler = NextAuth(authOptions)

export async function GET(
  req: Request,
  { params }: { params: { nextauth: string[] } }
) {
  try {
    // Extract action from params
    const action = params.nextauth[0]

    // Apply rate limiting for specific actions
    if (action === "callback" || action === "signin") {
      const rateLimitInfo = await getRateLimitInfo(action)

      if (!rateLimitInfo.success) {
        return new NextResponse(
          JSON.stringify({
            error: "Too many requests",
            retryAfter: Math.ceil((rateLimitInfo.reset - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(
                Math.ceil((rateLimitInfo.reset - Date.now()) / 1000)
              ),
            },
          }
        )
      }
    }

    // Create NextAuth handler
    const response = await handler(req)

    // Add security headers
    if (response instanceof Response) {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      )
      response.headers.set("X-Content-Type-Options", "nosniff")
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-XSS-Protection", "1; mode=block")
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; frame-ancestors 'none'"
      )
    }

    return response
  } catch (error) {
    console.error("Auth error:", error)

    // Handle NextAuth specific errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      if (
        errorMessage.includes("invalid") &&
        errorMessage.includes("credentials")
      ) {
        return new NextResponse(
          JSON.stringify({ error: "Invalid email or password" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      if (
        errorMessage.includes("too many") ||
        errorMessage.includes("rate limit")
      ) {
        return new NextResponse(
          JSON.stringify({ error: "Too many login attempts" }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      if (
        errorMessage.includes("session") &&
        errorMessage.includes("expired")
      ) {
        return new NextResponse(JSON.stringify({ error: "Session expired" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }

      if (
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("forbidden")
      ) {
        return new NextResponse(JSON.stringify({ error: "Access denied" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Log the actual error in test mode for debugging
      if (process.env.NODE_ENV === "test") {
        console.error("Test mode auth error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        })
      }
    }

    return new NextResponse(
      JSON.stringify({ error: "Internal authentication error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

export const POST = GET

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
