import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth-options"
import { UserRole } from "@/lib/auth/types"
import { Session } from "next-auth"
import { AUTH_CONFIG } from "@/lib/auth/config"

// Mark this route as dynamic to prevent static optimization
export const dynamic = "force-dynamic"

// Define proper types for the session data
interface UserSession {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: UserRole | null
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
export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") || "unknown"

  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        {
          user: null,
          expires: getExpiryDate(null),
          error: "Unauthorized",
        } as UserSession,
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      )
    }

    // Check if session has expired
    const expiryDate = new Date(session.expires)
    if (expiryDate.getTime() < Date.now()) {
      return NextResponse.json(
        {
          user: null,
          expires: getExpiryDate(null),
          error: "Session expired",
        } as UserSession,
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      )
    }

    // Verify user role
    if (!session.user.role) {
      return NextResponse.json(
        {
          user: null,
          expires: getExpiryDate(null),
          error: "Invalid user role",
        } as UserSession,
        {
          status: 403,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      )
    }

    return NextResponse.json(
      {
        user: createSafeUser(session.user),
        expires: getExpiryDate(session.expires),
        error: null,
      } as UserSession,
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    )
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json(
      {
        user: null,
        expires: getExpiryDate(null),
        error: "Failed to retrieve session",
      } as UserSession,
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    )
  }
}
