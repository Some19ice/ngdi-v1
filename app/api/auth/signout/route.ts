import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      return new NextResponse(JSON.stringify({ error: "Failed to sign out" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })

    // Clear all Supabase-related cookies
    const cookieStore = cookies()
    for (const cookie of cookieStore.getAll()) {
      if (cookie.name.startsWith("sb-") || cookie.name.includes("supabase")) {
        cookieStore.delete(cookie.name)
      }
    }

    return response
  } catch (error) {
    console.error("Error in signout route:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

// Also handle GET requests for convenience
export async function GET() {
  // GET requests always use local scope
  return POST(
    new Request("http://localhost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: "local" }),
    })
  )
}
