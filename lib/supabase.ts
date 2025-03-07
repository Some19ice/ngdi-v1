import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Helper function to decode base64 cookies
function decodeBase64Cookie(value: string): any {
  try {
    if (value.startsWith("base64-")) {
      const base64Content = value.slice(7)
      const decoded = atob(base64Content)

      // Try to parse as JSON if it looks like JSON
      if (decoded.trim().startsWith("{") && decoded.trim().endsWith("}")) {
        try {
          return JSON.parse(decoded)
        } catch (e) {
          console.error("Failed to parse base64-decoded JSON:", e)
          return decoded
        }
      }
      return decoded
    }

    // Try to parse as JSON
    try {
      return JSON.parse(value)
    } catch (e) {
      // If it's not JSON, return as is
      return value
    }
  } catch (error) {
    console.error("Error decoding cookie:", error)
    return value
  }
}

// Create a browser client (for client components)
export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
  cookies: {
    get(name: string) {
      if (typeof document === "undefined") return ""

      try {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) {
          const last = parts.pop()
          if (last) {
            const cookieValue = last.split(";").shift() || ""

            // Handle base64 encoded cookies
            if (cookieValue.startsWith("base64-")) {
              return decodeBase64Cookie(cookieValue)
            }

            // Try to parse as JSON
            try {
              return JSON.parse(cookieValue)
            } catch (e) {
              // If it's not JSON, return as is
              return cookieValue
            }
          }
        }
        return ""
      } catch (error) {
        console.error(`Error getting cookie ${name}:`, error)
        return ""
      }
    },
    set(name: string, value: string) {
      if (typeof document === "undefined") return

      try {
        // Handle objects by stringifying them
        let processedValue = value

        // If value is an object, stringify it
        if (typeof value === "object") {
          processedValue = JSON.stringify(value)
        }

        // Handle large cookies
        if (processedValue.length > 3072) {
          processedValue = `base64-${btoa(processedValue)}`
        }

        document.cookie = `${name}=${processedValue}; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax`
      } catch (error) {
        console.error(`Error setting cookie ${name}:`, error)
      }
    },
    remove(name: string) {
      if (typeof document === "undefined") return
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    },
  },
})

// Helper function to get the current user
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return user || null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return !!user
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

// Helper function to get user role
export async function getUserRole() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) return null

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (error) throw error
    return data?.role || null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}
