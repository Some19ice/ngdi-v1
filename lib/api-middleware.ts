import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Middleware to validate authentication for API routes
 * @param handler The API route handler
 * @returns A middleware-wrapped handler
 */
export function withAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Create a Supabase client
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
          "https://srbuueyoxonxzrswbzdu.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYnV1ZXlveG9ueHpyc3diemR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMTQ0NzIsImV4cCI6MjA1NDU5MDQ3Mn0.Z0nDXkUFEVD9A-_jbOWqkcIEhYzy12s8EqJ9uDlyqC4",
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              cookieStore.set(name, value, options)
            },
            remove(name: string, options: any) {
              cookieStore.set(name, "", { ...options, maxAge: 0 })
            },
          },
        }
      )

      // Get the token from the Authorization header
      const authHeader = req.headers.get("Authorization")
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null

      // If there's no token, check for a session
      if (!token) {
        // Check for a session in cookies
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          )
        }

        // Get the user's data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
          return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: 500 }
          )
        }

        // Call the handler with the authenticated user
        return handler(req, { ...session.user, ...userData })
      }

      // Validate the token
      const { data, error } = await supabase.auth.getUser(token)

      if (error || !data.user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      // Get the user's data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
        return NextResponse.json(
          { error: "Failed to fetch user data" },
          { status: 500 }
        )
      }

      // Call the handler with the authenticated user
      return handler(req, { ...data.user, ...userData })
    } catch (error) {
      console.error("Authentication middleware error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware to validate role-based access for API routes
 * @param handler The API route handler
 * @param allowedRoles Array of roles that are allowed to access the route
 * @returns A middleware-wrapped handler
 */
export function withRole(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  allowedRoles: string[]
) {
  return withAuth(async (req: NextRequest, user: any) => {
    // Check if the user has one of the allowed roles
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Call the handler with the authenticated user
    return handler(req, user)
  })
}

/**
 * Example usage:
 *
 * export const GET = withAuth(async (req, user) => {
 *   // This route requires authentication
 *   return NextResponse.json({ user })
 * })
 *
 * export const POST = withRole(async (req, user) => {
 *   // This route requires a specific role
 *   return NextResponse.json({ user })
 * }, ['admin'])
 */
