import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(req: NextRequest) {
  try {
    // Forward the request to the API server
    const response = await axios.post(`${API_URL}/api/auth/logout`)

    // Create a Next.js response
    const nextResponse = NextResponse.json(response.data)

    // Clear cookies directly in the Next.js response
    nextResponse.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
    })

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

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Logout failed",
      },
      { status: error.response?.status || 500 }
    )
  }
}
