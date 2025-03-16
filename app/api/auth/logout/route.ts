import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    console.log("Logout proxy: Forwarding request to API server")

    // Forward the request to the API server
    const response = await axios.post(`${API_URL}/api/auth/logout`)
    console.log("Logout proxy: Received response from API server", {
      status: response.status,
    })

    // Create a Next.js response
    const nextResponse = NextResponse.json(response.data)

    // Clear cookies directly in the Next.js response
    console.log("Logout proxy: Clearing auth_token cookie")
    nextResponse.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    })

    console.log("Logout proxy: Clearing refresh_token cookie")
    nextResponse.cookies.set({
      name: "refresh_token",
      value: "",
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    })

    return nextResponse
  } catch (error: any) {
    console.error("Logout proxy error:", error)

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
        message: error.response?.data?.message || "Logout failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: error.response?.status || 500 }
    )
  }
}
