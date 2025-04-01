import { NextRequest, NextResponse } from "next/server"

// Define API base URL - in production, use internal API URL to avoid loops
const API_BASE_URL = process.env.NODE_ENV === "production" 
  ? process.env.INTERNAL_API_URL || "http://localhost:3001" 
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(request: NextRequest) {
  console.log(`[AUTH PROXY - REFRESH] Environment: ${process.env.NODE_ENV}`)
  
  try {
    // First, make a GET request to get a CSRF token
    const csrfResponse = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      credentials: "include",
    })

    // Get the CSRF token from the cookies
    const setCookieHeader = csrfResponse.headers.get("set-cookie")
    let csrfToken = ""
    let csrfCookieValue = ""

    if (csrfResponse.ok && setCookieHeader) {
      const csrfCookie = setCookieHeader
        .split(";")
        .find((cookie) => cookie.trim().startsWith("csrf_token="))

      if (csrfCookie) {
        csrfToken = csrfCookie.split("=")[1].split(";")[0]
        csrfCookieValue = csrfCookie
        console.log("[AUTH PROXY - REFRESH] Successfully obtained CSRF token")
      } else {
        console.warn("[AUTH PROXY - REFRESH] CSRF token not found in cookies")
      }
    } else {
      console.warn(
        `[AUTH PROXY - REFRESH] Health check failed: ${csrfResponse.status}`
      )
    }

    // Forward the original request authorization headers if present
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Add CSRF token to headers if available
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken
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

    // Forward the request to the API server with the CSRF token
    const apiUrl = `${API_BASE_URL}/api/auth/refresh-token`
    console.log(`[AUTH PROXY - REFRESH] Forwarding to API: ${apiUrl}`)

    const requestBody = await request.json().catch(() => ({}))

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(requestBody),
    })

    console.log(
      `[AUTH PROXY - REFRESH] API Response status: ${apiResponse.status}`
    )

    const responseData = await apiResponse.json().catch(() => ({
      success: apiResponse.ok,
      message: apiResponse.ok
        ? "Token refresh successful"
        : "Token refresh failed",
    }))

    // Create the response
    const response = NextResponse.json(responseData, {
      status: apiResponse.status,
    })

    // Forward cookies from API to client
    const responseCookies = apiResponse.headers.get("set-cookie")
    if (responseCookies) {
      response.headers.set("set-cookie", responseCookies)
    } else if (csrfCookieValue) {
      // If no cookies in the response but we have a CSRF token, set it
      response.headers.set("set-cookie", csrfCookieValue)
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
