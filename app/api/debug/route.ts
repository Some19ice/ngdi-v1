import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { normalizeRole, UserRole } from "@/lib/auth/constants"

export async function GET(request: NextRequest) {
  try {
    // Get all cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()

    // Get the auth token from cookies
    const authToken = cookieStore.get("auth_token")?.value

    // Get the auth token from authorization header
    const authHeader = request.headers.get("authorization")
    const headerToken = authHeader?.replace("Bearer ", "")

    // Use the token from cookies or header
    const token = authToken || headerToken

    // Decode the token if it exists
    let decodedToken = null
    let tokenExpiry = null
    let isExpired = false
    let normalizedRole = null
    let isAdmin = false

    if (token) {
      try {
        decodedToken = jose.decodeJwt(token)

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000)
        tokenExpiry = decodedToken.exp
          ? new Date(decodedToken.exp * 1000).toISOString()
          : null
        isExpired = decodedToken.exp ? decodedToken.exp < currentTime : false

        // Normalize the role
        const rawRole = decodedToken.role as string | undefined
        normalizedRole = normalizeRole(rawRole)
        isAdmin = normalizedRole === UserRole.ADMIN
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }

    // Return debug information
    return NextResponse.json({
      request: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(
          Array.from(request.headers.entries()).filter(
            ([key]) => !key.includes("authorization") && !key.includes("cookie")
          )
        ),
      },
      cookies: {
        all: allCookies.map((c) => ({
          name: c.name,
          value: c.name.includes("token")
            ? `${c.value.substring(0, 10)}...`
            : c.value,
          path: c.path,
          expires: c.expires,
        })),
        hasAuthToken: !!authToken,
      },
      token: {
        source: authToken ? "cookie" : headerToken ? "header" : "none",
        preview: token ? `${token.substring(0, 10)}...` : null,
        decoded: decodedToken
          ? {
              sub: decodedToken.sub,
              exp: decodedToken.exp,
              iat: decodedToken.iat,
              role: decodedToken.role,
            }
          : null,
        expiry: tokenExpiry,
        isExpired,
      },
      role: {
        raw: decodedToken?.role,
        normalized: normalizedRole,
        isAdmin,
        adminRole: UserRole.ADMIN,
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
