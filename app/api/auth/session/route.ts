import { NextResponse } from "next/server"
import { createClient } from "../auth-options"

// Mark this route as dynamic to prevent static optimization
export const dynamic = "force-dynamic"

// Define proper types for the session data
interface UserSession {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: string | null
    organization: string | null
    department: string | null
    phone: string | null
  } | null
  expires: string
  error: string | null
}

// Extend Session type with our custom fields
type ExtendedSession = Omit<Session, "expires"> & {
  error?: string
  expires: string | Date
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: UserRole
    organization?: string | null
    department?: string | null
    phone?: string | null
  } | null
}

// Utility function to ensure dates are converted to strings and handle null values
function ensureSerializable(obj: any): any {
  if (obj === null || obj === undefined) return null

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (Array.isArray(obj)) {
    return obj.map(ensureSerializable)
  }

  if (typeof obj === "object") {
    const result: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = ensureSerializable(obj[key])
        if (value !== undefined) {
          result[key] = value
        }
      }
    }
    return result
  }

  return obj
}

// Helper to create a safe user object
function createSafeUser(rawUser: any): UserSession["user"] {
  if (!rawUser || typeof rawUser !== "object") return null

  return {
    id: rawUser.id || "",
    name: rawUser.name || null,
    email: rawUser.email || null,
    image: rawUser.image || null,
    role: (rawUser.role as UserRole) || null,
    organization: rawUser.organization || null,
    department: rawUser.department || null,
    phone: rawUser.phone || null,
  }
}

// Helper to safely get expiry date
function getExpiryDate(expires: Date | string | null): string {
  if (!expires) {
    return new Date(
      Date.now() + AUTH_CONFIG.session.maxAge * 1000
    ).toISOString()
  }
  return new Date(expires).toISOString()
}

// Custom session handler to prevent request body consumption issues
export async function GET() {
  try {
    // For development, you can use a mock session
    if (process.env.NODE_ENV === "development" && process.env.MOCK_AUTH === "true") {
      return NextResponse.json({
        user: {
          id: "mock-user-id",
          name: "Mock User",
          email: "mock@example.com",
          image: null,
          role: "user",
          organization: "Mock Organization",
          department: "Mock Department",
          phone: null
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }, { status: 200 })
    }

    // Try to get the session from Supabase
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ user: null, expires: null }, { status: 200 })
    }
    
    // Get user data from Supabase
    const { data: userData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
    
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: userData?.full_name || session.user.user_metadata?.full_name || null,
        email: session.user.email,
        image: userData?.avatar_url || null,
        role: userData?.role || "user",
        organization: userData?.organization || null,
        department: userData?.department || null,
        phone: userData?.phone || null
      },
      expires: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
    }, { status: 200 })
  } catch (error) {
    console.error("Error in session route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
