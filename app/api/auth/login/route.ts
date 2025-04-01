import { NextRequest, NextResponse } from "next/server"

// Define API base URL
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.INTERNAL_API_URL || "https://ngdi-api.vercel.app"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(request: NextRequest) {
  console.log(`[AUTH PROXY - LOGIN] Environment: ${process.env.NODE_ENV}`)
  console.log(`[AUTH PROXY - LOGIN] API URL: ${API_BASE_URL}`)
  
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
        console.log("[AUTH PROXY - LOGIN] Successfully obtained CSRF token")
      } else {
        console.warn("[AUTH PROXY - LOGIN] CSRF token not found in cookies")
      }
    } else {
      console.warn(
        `[AUTH PROXY - LOGIN] Health check failed: ${csrfResponse.status}`
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
    const apiUrl = `${API_BASE_URL}/api/auth/login`
    console.log(`[AUTH PROXY - LOGIN] Forwarding to API: ${apiUrl}`)

    const requestBody = await request.json()
    console.log(
      `[AUTH PROXY - LOGIN] Request data: ${JSON.stringify({
        email: requestBody.email,
        password: "[REDACTED]",
      })}`
    )

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(requestBody),
    })

    console.log(
      `[AUTH PROXY - LOGIN] API Response status: ${apiResponse.status}`
    )

    const responseData = await apiResponse.json()

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
    console.error("[AUTH PROXY - LOGIN] Error:", error)
    return NextResponse.json(
      { success: false, message: "Login failed", error: String(error) },
      { status: 500 }
    )
  }
}
