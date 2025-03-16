import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { cookies } from "next/headers"

// In production, we need to use the local API routes from the packages directory
const isProduction = process.env.NODE_ENV === "production"
const API_URL = isProduction 
  ? process.env.NEXT_PUBLIC_API_URL || "https://ngdi-v1.vercel.app/api" 
  : "http://localhost:3001"

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

    let responseData
    let accessToken
    let newRefreshToken

    if (isProduction) {
      // In production, we'll use the local API directly
      try {
        // Import the JWT utilities dynamically
        const { verifyRefreshToken, generateToken, generateRefreshToken } =
          await import("@/packages/api/src/utils/jwt")

        console.log("Refresh token proxy: Using direct JWT utils in production")

        // Verify the refresh token
        const decoded = await verifyRefreshToken(refreshToken)

        // Generate new tokens
        accessToken = await generateToken({
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        })

        newRefreshToken = await generateRefreshToken({
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        })

        responseData = {
          success: true,
          message: "Token refreshed",
          data: {
            accessToken,
            refreshToken: newRefreshToken,
          },
        }

        console.log("Refresh token proxy: Direct token refresh successful")
      } catch (importError) {
        console.error("Failed to import JWT utilities:", importError)
        throw new Error(
          "Failed to import JWT utilities: " +
            (importError instanceof Error
              ? importError.message
              : String(importError))
        )
      }
    } else {
      // In development, forward the request to the API server
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

      responseData = response.data
      accessToken = response.data.data?.accessToken
      newRefreshToken = response.data.data?.refreshToken
    }

    // Create a Next.js response
    const nextResponse = NextResponse.json(responseData)

    // Set cookies directly in the Next.js response
    if (accessToken) {
      console.log("Refresh token proxy: Setting new auth_token cookie")
      nextResponse.cookies.set({
        name: "auth_token",
        value: accessToken,
        httpOnly: true,
        path: "/",
        secure: isProduction,
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
        secure: isProduction,
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
