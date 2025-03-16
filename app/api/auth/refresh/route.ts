import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    console.log("Refresh token proxy: Processing refresh token request")

    // Get refresh token from cookies
    const cookieStore = cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    console.log("Refresh token proxy: Cookie status", {
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length,
    })

    if (!refreshToken) {
      console.log("Refresh token proxy: No refresh token found in cookies")
      return NextResponse.json(
        { success: false, message: "No refresh token found" },
        { status: 400 }
      )
    }

    // Forward the request to the API server
    console.log("Refresh token proxy: Forwarding request to API server")
    const response = await axios.post(
      `${API_URL}/api/auth/refresh-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    )

    console.log("Refresh token proxy: Received response from API server", {
      status: response.status,
      hasAccessToken: !!response.data.data?.accessToken,
      hasRefreshToken: !!response.data.data?.refreshToken,
    })

    // Create a Next.js response
    const nextResponse = NextResponse.json(response.data)

    // Extract tokens from the API response
    const accessToken = response.data.data?.accessToken
    const newRefreshToken = response.data.data?.refreshToken

    // Set cookies directly in the Next.js response
    if (accessToken) {
      console.log("Refresh token proxy: Setting new auth_token cookie")
      nextResponse.cookies.set({
        name: "auth_token",
        value: accessToken,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    if (newRefreshToken) {
      console.log("Refresh token proxy: Setting new refresh_token cookie")
      nextResponse.cookies.set({
        name: "refresh_token",
        value: newRefreshToken,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return nextResponse
  } catch (error: any) {
    console.error("Refresh token proxy error:", error)

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
        message: error.response?.data?.message || "Token refresh failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: error.response?.status || 500 }
    )
  }
}
