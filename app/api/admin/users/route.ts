import { NextRequest, NextResponse } from "next/server"

// Proxy route to forward requests to the main API server
export async function GET(request: NextRequest) {
  try {
    // Get the URL parameters
    const searchParams = request.nextUrl.searchParams
    const apiParams = new URLSearchParams(searchParams).toString()

    // Get the auth token from the request headers
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    // Forward the request to the main API server
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://ngdi-api.vercel.app"}/api/admin/users${apiParams ? `?${apiParams}` : ""}`

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    })

    // Return the response data
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error in admin users proxy:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
