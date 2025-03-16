import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    // Get login data from request
    const data = await req.json()
    
    console.log(`Login proxy: Forwarding request to ${API_URL}/api/auth/login`)

    // Forward the request to the API server
    const response = await axios.post(`${API_URL}/api/auth/login`, data)

    // Create the response
    const result = response.data

    console.log("Login proxy: API response received", {
      status: response.status,
      hasAccessToken: !!result.accessToken,
      hasRefreshToken: !!result.refreshToken,
      hasUser: !!result.user,
    })

    // Extract cookies from the API response
    const cookies = response.headers["set-cookie"] || []
    console.log("Login proxy: Cookies from API:", cookies)

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
    } else {
      console.log("Login proxy: No auth_token to set")
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
    } else {
      console.log("Login proxy: No refresh_token to set")
    }

    return nextResponse
  } catch (error: any) {
    console.error("Login proxy error:", error)

    // Enhanced error logging
    if (error.response) {
      console.error("API response error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      })
    } else if (error.request) {
      console.error("No response received:", error.request)
    } else {
      console.error("Error setting up request:", error.message)
    }

    if (error.config) {
      console.error("Request config:", {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers,
      })
    }

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || error.message || "Login failed",
        error:
          process.env.NODE_ENV === "development" ? error.toString() : undefined,
      },
      { status: error.response?.status || 500 }
    )
  }
}
