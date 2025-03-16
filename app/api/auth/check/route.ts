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

    if (!authToken) {
      return NextResponse.json(
        { authenticated: false, message: "No auth token found" },
        { status: 200 }
      )
    }

    // Decode the token without verification
    try {
      const decoded = jose.decodeJwt(authToken)

      // Extract user information
      const userId = decoded.sub || (decoded.userId as string)
      const email = decoded.email as string
      const role = decoded.role as string

      if (!userId) {
        return NextResponse.json(
          { authenticated: false, message: "Invalid token: missing user ID" },
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
          },
        },
        { status: 200 }
      )
    } catch (error) {
      console.error("Error decoding token:", error)
      return NextResponse.json(
        { authenticated: false, message: "Invalid token format" },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { authenticated: false, message: "Auth check failed" },
      { status: 500 }
    )
  }
}
