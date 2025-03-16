import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    // Get login data from request
    const data = await req.json()

    // Forward the request to the API server
    const response = await axios.post(`${API_URL}/api/auth/login`, data)

    // Create the response
    const result = response.data

    // Extract cookies from the API response
    const cookies = response.headers["set-cookie"] || []

    // Create a Next.js response
    const nextResponse = NextResponse.json(result)

    // Extract auth token and refresh token from the API response
    const authToken = result.accessToken
    const refreshToken = result.refreshToken

    // Set cookies directly in the Next.js response
    if (authToken) {
      nextResponse.cookies.set({
        name: "auth_token",
        value: authToken,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    if (refreshToken) {
      nextResponse.cookies.set({
        name: "refresh_token",
        value: refreshToken,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return nextResponse
  } catch (error: any) {
    console.error("Login proxy error:", error)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Login failed",
      },
      { status: error.response?.status || 500 }
    )
  }
}
