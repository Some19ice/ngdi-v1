import { NextRequest, NextResponse } from "next/server"

// Proxy route to forward requests to the main API server
export async function GET(request: NextRequest) {
  console.log("[PROXY] Received GET request to /api/admin/users")

  try {
    // Get the URL parameters
    const searchParams = request.nextUrl.searchParams
    const apiParams = new URLSearchParams(searchParams).toString()

    // Get the auth token from the request headers
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      console.error("[PROXY] No authorization header found")
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    // Forward the request to the main API server
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://ngdi-api.vercel.app"}/api/admin/users${apiParams ? `?${apiParams}` : ""}`
    console.log("[PROXY] Forwarding request to:", apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    })

    // Log response status and headers for debugging
    console.log("[PROXY] Response status:", response.status)
    console.log(
      "[PROXY] Response headers:",
      Object.fromEntries(response.headers.entries())
    )

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text()
      console.error("[PROXY] API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      return NextResponse.json(
        {
          success: false,
          message: `API error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      )
    }

    // Parse and validate response data
    const data = await response.json()
    if (!data || typeof data !== "object") {
      console.error("[PROXY] Invalid response format:", data)
      return NextResponse.json(
        { success: false, message: "Invalid response format from API" },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("[PROXY] Error in admin users proxy:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  console.log("[PROXY] Received OPTIONS request to /api/admin/users")
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
