import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { UserRole } from "@/lib/auth/constants"

export async function GET(req: NextRequest) {
  try {
    console.log("Auth check: Checking authentication status")

    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("auth_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value

    console.log("Auth check: Cookie status", {
      hasAuthToken: !!authToken,
      authTokenLength: authToken?.length,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length,
    })

    if (!authToken) {
      console.log("Auth check: No auth token found")
      return NextResponse.json(
        { authenticated: false, message: "No auth token found" },
        { status: 200 }
      )
    }

    // Decode the token without verification
    try {
      console.log("Auth check: Decoding token")
      const decoded = jose.decodeJwt(authToken)
      console.log("Auth check: Token decoded", {
        sub: decoded.sub,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "none",
      })

      // Extract user information
      const userId = decoded.sub || (decoded.userId as string)
      const email = decoded.email as string
      const role = decoded.role as string

      if (!userId) {
        console.log("Auth check: Invalid token - missing user ID")
        return NextResponse.json(
          { authenticated: false, message: "Invalid token: missing user ID" },
          { status: 200 }
        )
      }

      console.log("Auth check: Authentication successful", {
        userId,
        email,
        role,
      })
      
      return NextResponse.json(
        {
          authenticated: true,
          user: {
            id: userId,
            email: email || "unknown",
            role: role || UserRole.USER,
          },
          tokenInfo: {
            hasAuthToken: !!authToken,
            hasRefreshToken: !!refreshToken,
          },
        },
        { status: 200 }
      )
    } catch (error) {
      console.error("Auth check: Error decoding token:", error)
      return NextResponse.json(
        {
          authenticated: false,
          message: "Invalid token format",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Auth check: Unexpected error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        message: "Auth check failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
