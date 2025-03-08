"use client"

import { createBrowserClient } from "@supabase/ssr"
import { handleSignOutCleanup } from "./auth/session-utils"

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

// Track client instances with a simple cache
let clientInstance: ReturnType<typeof createBrowserClient> | null = null
let clientCreationAttempts = 0
const MAX_CLIENT_CREATION_ATTEMPTS = 3

export function createClient() {
  // Only create the client in the browser
  if (!isBrowser) {
    // Instead of warning every time, just log once in development
    // and silently return the dummy client in production
    if (
      process.env.NODE_ENV === "development" &&
      clientCreationAttempts < MAX_CLIENT_CREATION_ATTEMPTS
    ) {
      console.warn(
        "Attempted to create Supabase client in a non-browser environment"
      )
      clientCreationAttempts++

      // After max attempts, stop logging to reduce noise
      if (clientCreationAttempts === MAX_CLIENT_CREATION_ATTEMPTS) {
        console.warn("Suppressing further Supabase client creation warnings")
      }
    }

    // Return a dummy client for SSR
    return {
      auth: {
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: async () => {
          return { error: null }
        },
        refreshSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        setSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        updateUser: () =>
          Promise.resolve({ data: { user: null }, error: null }),
        // Add any other methods that might be used in your app
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

  // Return existing client if available to prevent multiple instances
  if (clientInstance) {
    return clientInstance
  }

  // Always ensure local storage is working before attempting to use Supabase
  const ensureLocalStorage = () => {
    try {
      const testKey = "supabase-storage-test"
      localStorage.setItem(testKey, "test")
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("LocalStorage not available:", e)
      }
      return false
    }
  }

  // Force localStorage to be used for persistent sessions
  const hasLocalStorage = ensureLocalStorage()

  try {
    console.log(
      "Creating new Supabase client instance with persistence:",
      hasLocalStorage
    )

    // Create the browser client with auto refresh and persistence
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: "pkce",
          autoRefreshToken: true,
          persistSession: hasLocalStorage,
          detectSessionInUrl: true,
          storage: hasLocalStorage ? window.localStorage : undefined,
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

              // Ensure cookies persist by setting appropriate defaults
              const defaultOptions = {
                maxAge: 60 * 60 * 24 * 30, // 30 days by default
                path: "/",
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              }

              const finalOptions = { ...defaultOptions, ...options }

              const cookieParts = [
                `${name}=${encodeURIComponent(processedValue)}`,
                finalOptions.maxAge && `Max-Age=${finalOptions.maxAge}`,
                finalOptions.path && `Path=${finalOptions.path}`,
                finalOptions.sameSite && `SameSite=${finalOptions.sameSite}`,
                finalOptions.domain && `Domain=${finalOptions.domain}`,
                finalOptions.secure && "Secure",
                finalOptions.httpOnly && "HttpOnly",
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

    // Try to detect an existing session and apply persistence immediately
    if (hasLocalStorage) {
      setTimeout(async () => {
        try {
          console.log("Checking for existing session")
          const { data } = await clientInstance!.auth.getSession()
          if (data.session) {
            console.log("Found existing session, ensuring persistence")
            const rememberMe = localStorage.getItem("remember_me") === "true"
            if (rememberMe) {
              console.log("Applying remember_me persistence")
              await clientInstance!.auth.updateUser({
                data: {
                  persistent: true,
                  remember_me: true,
                },
              })

              // Explicitly refresh the session to ensure it's valid
              try {
                console.log("Refreshing session")
                await clientInstance!.auth.refreshSession()
                console.log("Session refreshed successfully")
              } catch (refreshError) {
                console.error("Error refreshing session:", refreshError)
              }
            }
          } else {
            console.log("No existing session found")
          }
        } catch (e) {
          console.error("Error checking initial session:", e)
        }
      }, 100)
    }

    return clientInstance
  } catch (error) {
    console.error("Error creating Supabase client:", error)

    // Return dummy client if creation fails
    return {
      auth: {
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: async () => ({ error: null }),
        refreshSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        setSession: () =>
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
}
