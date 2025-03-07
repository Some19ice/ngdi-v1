import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

/**
 * API route to validate a token
 * This can be used by external services to verify if a token is valid
 */
export async function POST(request: NextRequest) {
  try {
    // Get the token from the request
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

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

    // Validate the token by getting the user
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return NextResponse.json(
        { valid: false, error: error?.message || "Invalid token" },
        { status: 401 }
      )
    }

    // Get the user's role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (userError) {
      console.error("Error fetching user role:", userError)
    }

    // Return the validation result
    return NextResponse.json({
      valid: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userData?.role || null,
      },
    })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * API route to check if the current user is authenticated
 */
export async function GET(request: NextRequest) {
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

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Get the user's role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      console.error("Error fetching user role:", userError)
    }

    // Return the authentication status
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: userData?.role || null,
      },
    })
  } catch (error) {
    console.error("Authentication check error:", error)
    return NextResponse.json(
      { authenticated: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
