import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Mark this route as dynamic to prevent static optimization
export const dynamic = "force-dynamic"

// Generate a random CSRF token
function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex")
}

export async function GET(request: NextRequest) {
  try {
    // Generate a CSRF token
    const csrfToken = generateCsrfToken()
    
    // Set the CSRF token in a cookie
    const response = NextResponse.json({ csrfToken }, { status: 200 })
    
    // Set the CSRF token cookie
    response.cookies.set({
      name: process.env.NODE_ENV === "production" ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
      value: csrfToken,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    })
    
    return response
  } catch (error) {
    console.error("Error in CSRF token route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
