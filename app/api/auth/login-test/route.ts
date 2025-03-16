import { NextRequest, NextResponse } from "next/server"
import * as jose from "jose"

export async function POST(req: NextRequest) {
  try {
    // Get login data from request
    const data = await req.json()
    const { email, password } = data

    console.log(`Login test: Received request for ${email}`)

    // Create a mock token (for testing only)
    const payload = {
      sub: "test-user-id",
      email: email,
      role: "USER",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    }

    // Convert payload to JWT format
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode("test-secret"))

    // Create a Next.js response with mock data
    const nextResponse = NextResponse.json({
      success: true,
      message: "Test login successful",
      user: {
        id: "test-user-id",
        email: email,
        name: "Test User",
        role: "USER",
      },
      accessToken: token,
      refreshToken: "test-refresh-token",
    })

    // Set cookies directly in the Next.js response
    console.log("Login test: Setting auth_token cookie")
    nextResponse.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("Login test: Setting refresh_token cookie")
    nextResponse.cookies.set({
      name: "refresh_token",
      value: "test-refresh-token",
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return nextResponse
  } catch (error: any) {
    console.error("Login test error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Test login failed",
        error: error.message,
      },
      { status: 500 }
    )
  }
}
