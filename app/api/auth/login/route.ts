import { NextRequest, NextResponse } from "next/server"

// Get API URL from environment variables
// In production, this should point to the internal API route
const API_URL = process.env.NODE_ENV === "production" 
  ? process.env.NEXT_PUBLIC_API_URL || "https://ngdi-v1.vercel.app/api" 
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(request: NextRequest) {
  try {
    // Log the environment and API URL for debugging
    console.log(
      `[login proxy] Environment: ${process.env.NODE_ENV}, API URL: ${API_URL}`
    )
    console.log(`[login proxy] Forwarding request to ${API_URL}/api/auth/login`)

    // Get the request body as JSON
    const body = await request.json().catch(() => {
      console.error("[login proxy] Failed to parse request body")
      return {}
    })

    // In production on Vercel, we need to use the internal API directly
    let apiUrl = `${API_URL}/api/auth/login`

    // If we're already at /api in the URL, don't duplicate it
    if (API_URL.endsWith("/api")) {
      apiUrl = `${API_URL}/auth/login`
    }

    console.log(`[login proxy] Final API URL: ${apiUrl}`)

    // Forward the request to the actual API server
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      duplex: "half" as const,
    } as RequestInit)

    // Log response status for debugging
    console.log(`[login proxy] Response status: ${response.status}`)

    // Get the response data
    const data = await response.json().catch((error) => {
      console.error(`[login proxy] Failed to parse response JSON:`, error)
      return { success: false, message: "Failed to parse API response" }
    })

    // Forward the status code
    const responseInit = {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    }

    // Log success or failure for debugging
    if (response.ok) {
      console.log("[login proxy] Successful:", {
        statusCode: response.status,
        hasUser: !!data.user,
        hasToken: !!data.accessToken,
      })
    } else {
      console.error("[login proxy] Error:", {
        statusCode: response.status,
        error: data,
      })
    }

    // Return the response with the same status code
    return NextResponse.json(data, responseInit)
  } catch (error) {
    console.error("[login proxy] Fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while connecting to the API server",
        error:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}
