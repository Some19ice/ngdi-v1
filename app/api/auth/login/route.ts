import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    console.log("Login proxy: Received login request")

    // Get login data from request
    const data = await req.json()
    console.log("Login proxy: Forwarding request to API server", {
      apiUrl: API_URL,
      email: data.email,
    })

    // Forward the request to the API server
    const response = await axios.post(`${API_URL}/api/auth/login`, data)

    // Create the response
    const result = response.data
    console.log("Login proxy: Received response from API server", {
      status: response.status,
      hasAccessToken: !!result.accessToken,
      hasRefreshToken: !!result.refreshToken,
      hasUser: !!result.user,
    })

    // Create a Next.js response
    const nextResponse = NextResponse.json(result)

    // Extract auth token and refresh token from the API response
    const authToken = result.accessToken
    const refreshToken = result.refreshToken

    // Set cookies directly in the Next.js response
    if (authToken) {
      console.log("Login proxy: Setting auth_token cookie")
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
      console.log("Login proxy: Setting refresh_token cookie")
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

    // Log detailed error information
    if (error.response) {
      console.error("API server response error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      })
    } else if (error.request) {
      console.error("No response received from API server:", error.request)
    } else {
      console.error("Error setting up request:", error.message)
    }

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Login failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: error.response?.status || 500 }
    )
  }
}
