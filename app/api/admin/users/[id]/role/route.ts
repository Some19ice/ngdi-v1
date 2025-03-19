import { NextRequest, NextResponse } from "next/server"

// Proxy route to forward user role update requests to the main API server
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Get the auth token from the request headers
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    // Get the request body
    const body = await request.json()

    // Forward the request to the main API server
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://ngdi-api.vercel.app"}/api/admin/users/${userId}/role`

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    })

    // Return the response data
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error in admin user role update proxy:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
