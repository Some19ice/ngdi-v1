export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth-options"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export default async function AuthTestPage() {
  // Check NextAuth session
  const session = await getServerSession(authOptions)

  // Check Supabase session
  let supabaseUser = null
  let supabaseSession = null
  let supabaseError = null

  try {
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Get all cookies as a string
    const cookieString = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Create Supabase client with proper cookie handling
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          cookie: cookieString,
        },
      },
    })

    // First get the session from cookies (more reliable)
    const sessionResult = await supabase.auth.getSession()
    if (sessionResult.error) {
      throw sessionResult.error
    }

    supabaseSession = sessionResult.data.session

    // Get user from session or directly
    if (supabaseSession?.user) {
      supabaseUser = supabaseSession.user
    } else {
      const userResult = await supabase.auth.getUser()
      if (userResult.error) {
        throw userResult.error
      }
      supabaseUser = userResult.data.user
    }
  } catch (error) {
    supabaseError = error instanceof Error ? error.message : "Unknown error"
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-md">
          <h2 className="font-semibold mb-2 text-blue-900">NextAuth Status:</h2>
          <div className="mb-2">
            <span
              className={`px-2 py-1 text-sm rounded ${
                session ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              {session ? "Authenticated" : "Not Authenticated"}
            </span>
          </div>
          <pre className="bg-black text-white p-4 rounded overflow-auto text-sm">
            {JSON.stringify(
              {
                authenticated: !!session,
                hasUser: !!session?.user,
                hasUserId: !!session?.user?.id,
                session: {
                  ...session,
                  // Only show partial data for security
                  user: session?.user
                    ? {
                        id: session.user.id?.substring(0, 8) + "...",
                        name: session.user.name,
                        email: session.user.email?.substring(0, 3) + "...",
                        role: session.user.role,
                        hasImage: !!session.user.image,
                        // Other fields presence
                        hasOrganization: !!session.user.organization,
                        hasDepartment: !!session.user.department,
                        hasPhone: !!session.user.phone,
                      }
                    : null,
                },
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="bg-green-50 p-4 rounded-md">
          <h2 className="font-semibold mb-2 text-green-900">
            Supabase Status:
          </h2>
          <div className="mb-2">
            <span
              className={`px-2 py-1 text-sm rounded ${
                supabaseUser
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {supabaseUser ? "Authenticated" : "Not Authenticated"}
            </span>
          </div>
          {supabaseError && (
            <div className="mb-2 p-2 bg-red-100 text-red-800 rounded text-sm">
              Error: {supabaseError}
            </div>
          )}
          <pre className="bg-black text-white p-4 rounded overflow-auto text-sm">
            {JSON.stringify(
              {
                authenticated: !!supabaseUser,
                hasSession: !!supabaseSession,
                hasUser: !!supabaseUser,
                hasUserId: !!supabaseUser?.id,
                // Session info if available
                session: supabaseSession
                  ? {
                      expiresAt: supabaseSession.expires_at,
                      tokenType: supabaseSession.token_type,
                      hasAccessToken: !!supabaseSession.access_token,
                      hasRefreshToken: !!supabaseSession.refresh_token,
                    }
                  : null,
                // Only show partial data for security
                user: supabaseUser
                  ? {
                      id: supabaseUser.id.substring(0, 8) + "...",
                      email: supabaseUser.email?.substring(0, 3) + "...",
                      hasMetadata: !!supabaseUser.user_metadata,
                      name: supabaseUser.user_metadata?.name,
                      role: supabaseUser.role,
                    }
                  : null,
                // Show what cookies are present (just names for security)
                authCookies: Array.from(cookies().getAll())
                  .filter(
                    (cookie) =>
                      cookie.name.includes("auth") ||
                      cookie.name.includes("sb-")
                  )
                  .map((cookie) => cookie.name),
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        <a
          href="/api/auth/signin"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign In with NextAuth
        </a>
        <a
          href="/auth/signin"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Sign In with Supabase
        </a>
        <a
          href="/api/auth/signout"
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out (NextAuth)
        </a>
        <a
          href="/auth/signout"
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out (Supabase)
        </a>
        <a
          href="/profile"
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Try Profile
        </a>
      </div>
    </div>
  )
}
