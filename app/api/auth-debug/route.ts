import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { normalizeRole, UserRole } from "@/lib/auth/constants"

export async function GET() {
  try {
    // Get all cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()

    // Get the auth token from cookies
    const authToken = cookieStore.get("auth_token")?.value

    // Decode the token if it exists
    let decodedToken = null
    let tokenExpiry = null
    let isExpired = false
    let normalizedRole = null
    let isAdmin = false

    if (authToken) {
      try {
        decodedToken = jose.decodeJwt(authToken)

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
      cookies: {
        all: allCookies.map((c) => ({
          name: c.name,
          value: c.name.includes("token")
            ? `${c.value.substring(0, 10)}...`
            : c.value,
        })),
        hasAuthToken: !!authToken,
      },
      token: {
        preview: authToken ? `${authToken.substring(0, 10)}...` : null,
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
