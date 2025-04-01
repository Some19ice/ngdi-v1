import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import path from "path"
import { fileURLToPath } from "url"

// In production, we need to use the local API routes from the packages directory
const isProduction = process.env.NODE_ENV === "production"
const API_URL = isProduction
  ? process.env.NEXT_PUBLIC_API_URL || "https://ngdi-v1.vercel.app/api"
  : "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    console.log("Login proxy: Received login request")

    // Get login data from request
    const data = await req.json()
    console.log("Login proxy: Forwarding request to API server", {
      apiUrl: API_URL,
      email: data.email,
      isProduction,
    })

    let result

    if (isProduction) {
      // In production, we'll use the local API directly
      try {
        // Import the auth service dynamically
        const { AuthService } = await import(
          "@/packages/api/src/services/auth.service"
        )
        console.log(
          "Login proxy: Using direct AuthService import in production"
        )

        // Call the login method directly
        result = await AuthService.login(data)
        console.log("Login proxy: Direct login successful")
      } catch (importError) {
        console.error("Failed to import AuthService:", importError)
        throw new Error(
          "Failed to import authentication service: " +
            (importError instanceof Error
              ? importError.message
              : String(importError))
        )
      }
    } else {
      // In development, forward the request to the API server
      const response = await axios.post(`${API_URL}/api/auth/login`, data)
      result = response.data
      console.log("Login proxy: Received response from API server", {
        status: response.status,
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
        hasUser: !!result.user,
      })
    }

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
        httpOnly: false, // Allow JavaScript access so client can read token
        path: "/",
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    if (refreshToken) {
      console.log("Login proxy: Setting refresh_token cookie")
      nextResponse.cookies.set({
        name: "refresh_token",
        value: refreshToken,
        httpOnly: true, // Protect refresh token from JavaScript access
        path: "/",
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 14, // 14 days for refresh token
      })
    }

    // Add Cache-Control header to prevent caching of auth responses
    nextResponse.headers.set("Cache-Control", "no-store, max-age=0")

    // Also set the tokens in response body for client-side fallback
    // This helps ensure tokens are available even if cookies fail
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
