import { NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/api-middleware"

/**
 * GET /api/admin/users
 * Returns a list of all users (admin only)
 */
export const GET = withRole(
  async (req: NextRequest, user: any) => {
    try {
      // Create a Supabase client using the server component
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase-server"
      )
      const supabase = createServerSupabaseClient()

      // Parse query parameters
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get("page") || "1")
      const limit = parseInt(url.searchParams.get("limit") || "10")
      const sortBy = url.searchParams.get("sortBy") || "created_at"
      const sortOrder = url.searchParams.get("sortOrder") || "desc"

      // Calculate pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      // Fetch users with pagination
      const { data, error, count } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range(from, to)

      if (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json(
          { error: "Failed to fetch users" },
          { status: 500 }
        )
      }

      // Format the response
      const users = data.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name || null,
        role: user.role || null,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }))

      return NextResponse.json({
        users,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: count ? Math.ceil(count / limit) : 0,
        },
      })
    } catch (error) {
      console.error("Error in GET /api/admin/users:", error)
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      )
    }
  },
  ["admin"] // Only users with the 'admin' role can access this route
)

/**
 * POST /api/admin/users
 * Creates a new user (admin only)
 */
export const POST = withRole(
  async (req: NextRequest, user: any) => {
    try {
      // Parse the request body
      const body = await req.json()

      // Validate required fields
      if (!body.email || !body.password) {
        return NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 }
        )
      }

      // Create a Supabase client using the server component
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase-server"
      )
      const supabase = createServerSupabaseClient()

      // Create the user in Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true, // Auto-confirm the email
          user_metadata: {
            name: body.name || null,
          },
        })

      if (authError) {
        console.error("Error creating user in Auth:", authError)
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }

      // Create the user in the users table
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: body.email,
          name: body.name || null,
          role: body.role || "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating user in database:", error)
        // Clean up the auth user if the database insert fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          id: data.id,
          email: data.email,
          name: data.name || null,
          role: data.role || null,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error("Error in POST /api/admin/users:", error)
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      )
    }
  },
  ["admin"] // Only users with the 'admin' role can access this route
)
