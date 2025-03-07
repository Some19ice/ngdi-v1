"use client"

import { createBrowserClient } from "@supabase/ssr"

// Custom cookie parser that properly handles base64-encoded cookies
function parseCookieValue(value: string | undefined) {
  if (!value) return null
  try {
    // First decode the URI component
    const decodedValue = decodeURIComponent(value)

    // Handle base64 encoded cookies
    if (decodedValue.startsWith("base64-")) {
      try {
        const base64Content = decodedValue.slice(7)
        const decoded = atob(base64Content)

        // Try to parse as JSON if it looks like JSON
        if (decoded.trim().startsWith("{") && decoded.trim().endsWith("}")) {
          try {
            return JSON.parse(decoded)
          } catch (jsonError) {
            // If JSON parsing fails, return the raw decoded string
            console.error("Failed to parse base64-decoded JSON:", jsonError)
            return decoded
          }
        }
        // If it doesn't look like JSON, just return the decoded string
        return decoded
      } catch (e) {
        console.error("Error decoding base64 cookie:", e)
        return decodedValue
      }
    }

    // Try to parse as JSON if it looks like JSON
    if (
      decodedValue.trim().startsWith("{") &&
      decodedValue.trim().endsWith("}")
    ) {
      try {
        return JSON.parse(decodedValue)
      } catch (jsonError) {
        // If JSON parsing fails, return the raw decoded string
        return decodedValue
      }
    }

    // Return the decoded value as is
    return decodedValue
  } catch (error) {
    console.error("Error parsing cookie:", error)
    return value
  }
}

// Create a singleton instance
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined"

// Helper function to get a cookie by name
function getCookie(name: string): string | null {
  if (!isBrowser) return null

  try {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1]

    return value ? decodeURIComponent(value) : null
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error)
    return null
  }
}

export function createClient() {
  // Only create the client in the browser
  if (!isBrowser) {
    console.warn(
      "Attempted to create Supabase client in a non-browser environment"
    )
    // Return a dummy client for SSR
    return {
      auth: {
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: () => Promise.resolve({ error: null }),
        refreshSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    } as any
  }

  // Only create the client once
  if (clientInstance) return clientInstance

  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      cookies: {
        get(name: string) {
          try {
            if (!isBrowser) return null

            // Get the cookie value
            const value = getCookie(name)
            if (!value) return null

            // Special handling for base64-encoded cookies
            if (value.startsWith("base64-")) {
              try {
                const base64Content = value.slice(7)
                const decoded = atob(base64Content)

                // Try to parse as JSON if it looks like JSON
                if (
                  decoded.trim().startsWith("{") &&
                  decoded.trim().endsWith("}")
                ) {
                  try {
                    return JSON.parse(decoded)
                  } catch (e) {
                    // If JSON parsing fails, return the raw decoded string
                    return decoded
                  }
                }
                return decoded
              } catch (e) {
                console.error(`Error decoding base64 cookie ${name}:`, e)
                return value
              }
            }

            // Try to parse as JSON
            try {
              return JSON.parse(value)
            } catch (e) {
              // If it's not JSON, return as is
              return value
            }
          } catch (error) {
            console.error(`Error getting cookie ${name}:`, error)
            return null
          }
        },
        set(name: string, value: string, options: any) {
          try {
            if (!isBrowser) return

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

            const cookieParts = [
              `${name}=${encodeURIComponent(processedValue)}`,
              options.maxAge && `Max-Age=${options.maxAge}`,
              options.path && `Path=${options.path}`,
              options.sameSite && `SameSite=${options.sameSite}`,
              options.domain && `Domain=${options.domain}`,
              options.secure && "Secure",
              options.httpOnly && "HttpOnly",
            ].filter(Boolean)

            document.cookie = cookieParts.join("; ")
          } catch (error) {
            console.error(`Error setting cookie ${name}:`, error)
          }
        },
        remove(name: string, options: any) {
          try {
            if (!isBrowser) return

            const cookieParts = [
              `${name}=`,
              "Max-Age=-1",
              options.path && `Path=${options.path || "/"}`,
              options.sameSite && `SameSite=${options.sameSite || "lax"}`,
              options.domain && `Domain=${options.domain}`,
              options.secure && "Secure",
            ].filter(Boolean)

            document.cookie = cookieParts.join("; ")
          } catch (error) {
            console.error(`Error removing cookie ${name}:`, error)
          }
        },
      },
    }
  )

  return clientInstance
}
