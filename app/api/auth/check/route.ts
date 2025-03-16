import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { UserRole } from "@/lib/auth/constants"

// In production, we need to use the local API routes from the packages directory
const isProduction = process.env.NODE_ENV === "production"

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
      isProduction,
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
      let decoded
      let userId
      let email
      let role

      if (isProduction) {
        try {
          // Import the JWT utilities dynamically in production
          const { verifyToken } = await import("@/packages/api/src/utils/jwt")
          console.log("Auth check: Using direct JWT verification in production")

          // Verify the token
          const verifiedToken = await verifyToken(authToken)
          userId = verifiedToken.userId
          email = verifiedToken.email
          role = verifiedToken.role

          console.log("Auth check: Token verified with direct JWT utils", {
            userId,
            email,
            role,
          })
        } catch (importError) {
          console.error("Failed to import JWT utilities:", importError)
          // Fall back to jose decoding if import fails
          decoded = jose.decodeJwt(authToken)
          userId = decoded.sub || (decoded.userId as string)
          email = decoded.email as string
          role = decoded.role as string
        }
      } else {
        console.log("Auth check: Decoding token with jose")
        decoded = jose.decodeJwt(authToken)
        console.log("Auth check: Token decoded", {
          sub: decoded.sub,
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          exp: decoded.exp
            ? new Date(decoded.exp * 1000).toISOString()
            : "none",
        })

        // Extract user information
        userId = decoded.sub || (decoded.userId as string)
        email = decoded.email as string
        role = decoded.role as string
      }

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
