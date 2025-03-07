import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"

/**
 * GET /api/users/me
 * Returns the current user's profile
 */
export const GET = withAuth(async (req: NextRequest, user: any) => {
  try {
    // The user object is already populated by the withAuth middleware
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name || null,
      role: user.role || null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    })
  } catch (error) {
    console.error("Error in GET /api/users/me:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/users/me
 * Updates the current user's profile
 */
export const PUT = withAuth(async (req: NextRequest, user: any) => {
  try {
    // Parse the request body
    const body = await req.json()

    // Create a Supabase client using the server component
    const { createServerSupabaseClient } = await import("@/lib/supabase-server")
    const supabase = createServerSupabaseClient()

    // Update the user's profile
    const { data, error } = await supabase
      .from("users")
      .update({
        name: body.name,
        // Add other fields as needed
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user profile:", error)
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: data.id,
      email: data.email,
      name: data.name || null,
      role: data.role || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error("Error in PUT /api/users/me:", error)
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    )
  }
})
