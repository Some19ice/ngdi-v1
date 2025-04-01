import { NextRequest, NextResponse } from "next/server"

// Get API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function POST(request: NextRequest) {
  try {
    console.log(`Proxying logout request to ${API_URL}/api/auth/logout`)

    // Get the request body as JSON
    const body = await request.json().catch(() => ({}))

    // Forward the request to the actual API server
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      duplex: "half" as const,
    } as RequestInit)

    // Get the response data
    const data = await response.json().catch(() => ({}))

    // Forward the status code
    const responseInit = {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    }

    // Log success or failure for debugging
    if (response.ok) {
      console.log("Logout proxy successful:", { statusCode: response.status })
    } else {
      console.error("Logout proxy error:", {
        statusCode: response.status,
        error: data,
      })
    }

    // Return the response with the same status code
    return NextResponse.json(data, responseInit)
  } catch (error) {
    console.error("Logout proxy fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while connecting to the API server",
      },
      { status: 500 }
    )
  }
}
