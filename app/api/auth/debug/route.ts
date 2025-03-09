import { NextRequest, NextResponse } from "next/server"
import * as jose from "jose"
import { normalizeRole, UserRole } from "@/lib/auth/constants"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("auth_token")?.value

    // Get the auth token from authorization header
    const authHeader = request.headers.get("authorization")
    const headerToken = authHeader?.replace("Bearer ", "")

    // Use the token from cookies or header
    const token = authToken || headerToken

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      )
    }

    // Decode the token
    const decoded = jose.decodeJwt(token)

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000)
    const isExpired = decoded.exp && decoded.exp < currentTime

    // Normalize the role
    const rawRole = decoded.role as string | undefined
    const normalizedRole = normalizeRole(rawRole)

    // Check if role is valid
    const isAdmin = normalizedRole === UserRole.ADMIN
    const isNodeOfficer = normalizedRole === UserRole.NODE_OFFICER
    const isUser = normalizedRole === UserRole.USER

    // Return debug information
    return NextResponse.json({
      token: {
        source: authToken ? "cookie" : headerToken ? "header" : "none",
        preview: token
          ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
          : null,
      },
      decoded: {
        sub: decoded.sub,
        exp: decoded.exp,
        iat: decoded.iat,
        role: decoded.role,
      },
      expiry: {
        current: new Date(currentTime * 1000).toISOString(),
        expires: decoded.exp
          ? new Date(decoded.exp * 1000).toISOString()
          : null,
        isExpired,
        timeRemaining: decoded.exp
          ? Math.floor((decoded.exp - currentTime) / 60) + " minutes"
          : null,
      },
      role: {
        raw: rawRole,
        normalized: normalizedRole,
        isAdmin,
        isNodeOfficer,
        isUser,
        adminRole: UserRole.ADMIN,
        nodeOfficerRole: UserRole.NODE_OFFICER,
        userRole: UserRole.USER,
      },
      constants: {
        UserRole: Object.entries(UserRole).map(([key, value]) => ({
          key,
          value,
        })),
      },
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
