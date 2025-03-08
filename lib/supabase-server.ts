import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { redirect } from "next/navigation"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create a Supabase client for server components
 * This should only be used in Server Components or Server Actions
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true, // Enable auto refresh token on server side
      persistSession: true,
      detectSessionInUrl: false, // Disable auto-detection to prevent errors
    },
    cookies: {
      get(name) {
        try {
          const cookie = cookieStore.get(name)
          return cookie?.value
        } catch (e) {
          console.error(`Error getting cookie ${name}:`, e)
          return null
        }
      },
      set(name, value, options) {
        // In Next.js App Router, cookies can only be set in Server Actions or Route Handlers
        // We'll just log the attempt but not actually set the cookie
        // The cookie will be set properly during the next server action or route handler call
        if (process.env.NODE_ENV === "development") {
          console.log(`Would set cookie ${name} (skipped in server component)`)
        }
      },
      remove(name) {
        // In Next.js App Router, cookies can only be removed in Server Actions or Route Handlers
        // We'll just log the attempt but not actually remove the cookie
        if (process.env.NODE_ENV === "development") {
          console.log(
            `Would remove cookie ${name} (skipped in server component)`
          )
        }
      },
    },
  })
}

/**
 * Server action to set a cookie
 * This must be called from a Server Action or Route Handler
 */
export async function setCookie(
  name: string,
  value: string,
  options: any = {}
) {
  "use server"
  try {
    const cookieStore = cookies()
    cookieStore.set(name, value, {
      ...options,
      maxAge: options.maxAge || 60 * 60 * 24 * 7, // 7 days by default
      path: options.path || "/",
      sameSite: options.sameSite || "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    })
    return { success: true }
  } catch (error) {
    console.error("Error setting cookie in server action:", error)
    return { success: false, error }
  }
}

/**
 * Server action to remove a cookie
 * This must be called from a Server Action or Route Handler
 */
export async function removeCookie(name: string) {
  "use server"
  try {
    const cookieStore = cookies()
    cookieStore.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
    })
    return { success: true }
  } catch (error) {
    console.error("Error removing cookie in server action:", error)
    return { success: false, error }
  }
}

/**
 * Get the current user from the server
 * Uses getUser() for better security instead of getSession()
 */
export async function getServerUser() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      // For AuthSessionMissingError, just return null quietly
      if (
        error.message?.includes("Auth session missing") ||
        error.name === "AuthSessionMissingError"
      ) {
        return null
      }
      console.error("Error getting server user:", error)
      return null
    }

    return data.user
  } catch (error) {
    console.error("Error getting server user:", error)
    return null
  }
}

/**
 * Check if the user is authenticated from the server
 */
export async function isServerAuthenticated() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      // For AuthSessionMissingError, just return false quietly
      if (
        error.message?.includes("Auth session missing") ||
        error.name === "AuthSessionMissingError"
      ) {
        return false
      }
      console.error("Error checking server authentication:", error)
      return false
    }

    return !!data.user
  } catch (error) {
    console.error("Error checking server authentication:", error)
    return false
  }
}

/**
 * Get the user's role from the server
 */
export async function getServerUserRole() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error: userError } = await supabase.auth.getUser()

    if (userError) {
      // For AuthSessionMissingError, just return null quietly
      if (
        userError.message?.includes("Auth session missing") ||
        userError.name === "AuthSessionMissingError"
      ) {
        return null
      }
      console.error("Error getting user for role check:", userError)
      return null
    }

    if (!data.user) return null

    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (error) {
      console.error("Error fetching user role:", error)
      return null
    }

    return userData?.role || null
  } catch (error) {
    console.error("Error getting server user role:", error)
    return null
  }
}

/**
 * Server action to sign out by clearing all auth-related cookies
 * @param scope The scope of the sign-out operation ('local' or 'global')
 */
export async function serverSignOut(scope: "local" | "global" = "local") {
  "use server"
  try {
    const cookieStore = cookies()

    // Be more comprehensive about which cookies to clear
    // Target all Supabase and auth-related cookies
    const cookiesToRemove = [
      "sb-access-token",
      "sb-refresh-token",
      "next-auth.session-token",
      "next-auth.callback-url",
      "next-auth.csrf-token",
      ...Array.from(cookieStore.getAll())
        .filter(
          (cookie) =>
            cookie.name.includes("sb-") ||
            cookie.name.includes("supabase") ||
            cookie.name.includes("auth") ||
            cookie.name.includes("session") ||
            cookie.name.includes("token")
        )
        .map((cookie) => cookie.name),
    ]

    // Remove each cookie
    for (const cookieName of cookiesToRemove) {
      try {
        // Set the cookie with an expired date and clear its value
        cookieStore.set(cookieName, "", {
          maxAge: 0,
          expires: new Date(0), // Set to epoch time for immediate expiration
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })

        // Also try setting it without httpOnly for client-accessible cookies
        cookieStore.set(cookieName, "", {
          maxAge: 0,
          expires: new Date(0),
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })
      } catch (e) {
        console.error(`Error removing cookie ${cookieName}:`, e)
      }
    }

    // Get the Supabase client and call signOut
    const supabase = createServerSupabaseClient()
    try {
      // Use the provided scope parameter
      await supabase.auth.signOut({ scope })
      console.log(`Server-side sign-out with scope '${scope}' completed`)
    } catch (e) {
      console.error(`Error in Supabase signOut with scope '${scope}':`, e)
      // Continue even if there's an error here
    }

    return { success: true }
  } catch (error) {
    console.error("Error in serverSignOut:", error)
    return { success: false, error: String(error) }
  }
}
