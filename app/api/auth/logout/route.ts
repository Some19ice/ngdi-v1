import { NextRequest, NextResponse } from "next/server"

// Define API base URL
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.INTERNAL_API_URL || "https://ngdi-api.vercel.app"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(request: NextRequest) {
  console.log("[AUTH PROXY - LOGOUT] Processing logout request")
  console.log(`[AUTH PROXY - LOGOUT] API URL: ${API_BASE_URL}`)
  
  try {
    // Forward the original request authorization headers if present
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Forward the authorization header if present
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    // Forward cookies if present
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader
    }

    // Forward the request to the API server
    const apiUrl = `${API_BASE_URL}/api/auth/logout`
    console.log(`[AUTH PROXY - LOGOUT] Forwarding to API: ${apiUrl}`)

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      credentials: "include",
    })

    // Create the response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    )

    // Clear auth cookies
    response.cookies.set("auth_token", "", {
      expires: new Date(0),
      path: "/",
    })
    response.cookies.set("refresh_token", "", {
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[AUTH PROXY - LOGOUT] Error:", error)
    return NextResponse.json(
      { success: false, message: "Logout failed", error: String(error) },
      { status: 500 }
    )
  }
}
