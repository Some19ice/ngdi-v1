import { createServerClient as createClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

// Helper function to parse cookie values
function parseCookieValue(value: string | undefined) {
  if (!value) return null
  try {
    // Handle base64 encoded cookies
    if (value.startsWith("base64-")) {
      try {
        const decoded = Buffer.from(value.slice(7), "base64").toString()

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
        return value
      }
    }

    // Try to parse as JSON if it looks like JSON
    if (value.trim().startsWith("{") && value.trim().endsWith("}")) {
      try {
        return JSON.parse(value)
      } catch (jsonError) {
        // If JSON parsing fails, return the raw decoded string
        return value
      }
    }

    // Return the value as is
    return value
  } catch (error) {
    console.error("Error parsing cookie:", error)
    return value
  }
}

export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const cookie = cookieStore.get(name)
            return parseCookieValue(cookie?.value)
          } catch (error) {
            console.error("Error getting cookie:", error)
            return null
          }
        },
        set(
          name: string,
          value: string,
          options: Omit<ResponseCookie, "name" | "value">
        ) {
          try {
            // Process the value
            let processedValue: string

            // Convert objects to JSON strings
            if (typeof value === "object") {
              processedValue = JSON.stringify(value)
            } else {
              processedValue = String(value)
            }

            // Handle large values with base64 encoding
            if (processedValue.length > 3072) {
              processedValue = `base64-${Buffer.from(processedValue).toString(
                "base64"
              )}`
            }

            cookieStore.set({
              name,
              value: processedValue,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              httpOnly: true,
              path: "/",
              ...options,
            })
          } catch (error) {
            console.error("Error setting cookie:", error)
          }
        },
        remove(name: string, options: Omit<ResponseCookie, "name" | "value">) {
          try {
            cookieStore.set({
              name,
              value: "",
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              httpOnly: true,
              path: "/",
              maxAge: 0,
              ...options,
            })
          } catch (error) {
            console.error("Error removing cookie:", error)
          }
        },
      },
    }
  )
}
