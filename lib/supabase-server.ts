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
      autoRefreshToken: false, // We'll handle refresh manually to avoid cookie issues
      persistSession: true,
    },
    cookies: {
      get(name) {
        const cookie = cookieStore.get(name)
        return cookie?.value
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
    if (error) throw error
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
    if (error) throw error
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
    if (userError || !data.user) return null

    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (error) throw error
    return userData?.role || null
  } catch (error) {
    console.error("Error getting server user role:", error)
    return null
  }
}
