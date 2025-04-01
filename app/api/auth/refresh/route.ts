import { NextRequest, NextResponse } from "next/server"

// Define API base URL
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.INTERNAL_API_URL || "https://ngdi-api.vercel.app"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(request: NextRequest) {
  console.log("[AUTH PROXY - REFRESH] Processing refresh token request")
  console.log(`[AUTH PROXY - REFRESH] API URL: ${API_BASE_URL}`)
  
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
    const apiUrl = `${API_BASE_URL}/api/auth/refresh-token`
    console.log(`[AUTH PROXY - REFRESH] Forwarding to API: ${apiUrl}`)

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      credentials: "include",
    })

    console.log(
      `[AUTH PROXY - REFRESH] API Response status: ${apiResponse.status}`
    )

    if (!apiResponse.ok) {
      console.error("[AUTH PROXY - REFRESH] API error:", apiResponse.statusText)
      return NextResponse.json(
        { success: false, message: "Token refresh failed" },
        { status: apiResponse.status }
      )
    }

    const responseData = await apiResponse.json()

    // Create the response
    const response = NextResponse.json(responseData, {
      status: apiResponse.status,
    })

    // Forward cookies from API to client
    const responseCookies = apiResponse.headers.get("set-cookie")
    if (responseCookies) {
      response.headers.set("set-cookie", responseCookies)
    }

    // Also manually set the cookies from the response data
    if (responseData.data && responseData.data.accessToken) {
      response.cookies.set("auth_token", responseData.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      })
    }

    if (responseData.data && responseData.data.refreshToken) {
      response.cookies.set("refresh_token", responseData.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return response
  } catch (error) {
    console.error("[AUTH PROXY - REFRESH] Error:", error)
    return NextResponse.json(
      { success: false, message: "Token refresh failed", error: String(error) },
      { status: 500 }
    )
  }
}
