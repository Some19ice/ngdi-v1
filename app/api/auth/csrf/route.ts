import { getCsrfToken } from "next-auth/react"
import { NextRequest, NextResponse } from "next/server"

// Mark this route as dynamic to prevent static optimization
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const csrfToken = await getCsrfToken({ req: request as any })
    
    return NextResponse.json({ csrfToken }, { status: 200 })
  } catch (error) {
    console.error("Error in CSRF token route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
