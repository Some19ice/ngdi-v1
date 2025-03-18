import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

    // Get user profile
    const response = await fetch(`${apiUrl}/api/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add an auth header if needed
        // 'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in test API route:", error)
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    const body = await request.json()

    console.log("Test profile update with data:", body)

    // Update profile
    const response = await fetch(`${apiUrl}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Add an auth header if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: body.name || "Test User",
        email: body.email || "test@example.com",
        organization: body.organization,
        department: body.department,
        phone: body.phone,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Profile update failed:", errorBody)

      return NextResponse.json(
        {
          error: `API Error: ${response.status} ${response.statusText}`,
          details: errorBody,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in test API route:", error)
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    )
  }
}
