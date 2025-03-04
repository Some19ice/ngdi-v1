import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { UserRole } from "@/lib/auth/types"

// Paths that require authentication
const protectedPaths = ["/api/protected", "/api/admin", "/api/user"]

// Paths that require specific roles
const roleBasedPaths = {
  "/api/admin": [UserRole.ADMIN],
  "/api/node-officer": [UserRole.NODE_OFFICER],
  "/api/user": [UserRole.USER, UserRole.ADMIN, UserRole.NODE_OFFICER],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for non-protected paths
  if (
    !protectedPaths.some((path) => pathname.startsWith(path)) &&
    !pathname.includes("api/auth")
  ) {
    return NextResponse.next()
  }

  try {
    // Get the token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Handle auth routes separately
    if (pathname.includes("api/auth")) {
      return NextResponse.next()
    }

    // Check if authentication is required
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    }

    // Check role-based access
    for (const [path, roles] of Object.entries(roleBasedPaths)) {
      if (pathname.startsWith(path)) {
        const userRole = token.role as UserRole
        if (!roles.includes(userRole)) {
          return new NextResponse(JSON.stringify({ error: "Access denied" }), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          })
        }
        break
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
}

export const config = {
  matcher: [
    "/api/protected/:path*",
    "/api/admin/:path*",
    "/api/user/:path*",
    "/api/node-officer/:path*",
    "/api/auth/:path*",
  ],
}
