import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { UserRole } from "@/lib/auth/constants"

export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("auth_token")?.value
    const refreshToken = cookieStore.get("refresh_token")?.value
    
    console.log("Auth check: Cookie status", {
      hasAuthToken: !!authToken,
      authTokenLength: authToken?.length,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length,
      allCookies: cookieStore.getAll().map((c) => c.name),
    })

    if (!authToken) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "No auth token found",
          cookieInfo: {
            allCookies: cookieStore.getAll().map((c) => c.name),
          },
        },
        { status: 200 }
      )
    }

    // Decode the token without verification
    try {
      const decoded = jose.decodeJwt(authToken)
      
      console.log("Auth check: Token decoded", {
        sub: decoded.sub,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp
          ? new Date(decoded.exp * 1000).toLocaleString()
          : "none",
      })

      // Extract user information
      const userId = decoded.sub || (decoded.userId as string)
      const email = decoded.email as string
      const role = decoded.role as string

      if (!userId) {
        return NextResponse.json(
          {
            authenticated: false,
            message: "Invalid token: missing user ID",
            tokenInfo: {
              sub: decoded.sub,
              userId: decoded.userId,
              email: decoded.email,
              role: decoded.role,
            },
          },
          { status: 200 }
        )
      }

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
            tokenExpiry: decoded.exp
              ? new Date(decoded.exp * 1000).toLocaleString()
              : "unknown",
          },
        },
        { status: 200 }
      )
    } catch (error) {
      console.error("Error decoding token:", error)
      return NextResponse.json(
        {
          authenticated: false,
          message: "Invalid token format",
          error: error instanceof Error ? error.message : String(error),
          tokenPreview: authToken?.substring(0, 20) + "...",
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Auth check error:", error)
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
