"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { hasRememberMeFlag } from "@/lib/auth/session-utils"

/**
 * Silent session refresher component that ensures authentication
 * sessions are kept alive when the user has enabled "remember me"
 */
export default function SessionRefresher() {
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefreshRef = useRef<number>(0)
  const [hasSession, setHasSession] = useState<boolean>(false)

  // Initial session check
  useEffect(() => {
    // Ensure we only run in the browser
    if (typeof window === "undefined") return

    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()

        // Check if we have a valid session and remember me is enabled
        const hasValidSession = !!data?.session
        const rememberMeEnabled = hasRememberMeFlag()

        console.log(
          "SessionRefresher: Initial check - Session exists:",
          hasValidSession,
          "Remember me:",
          rememberMeEnabled
        )

        setHasSession(hasValidSession && rememberMeEnabled)
      } catch (error) {
        console.error("SessionRefresher: Error checking session:", error)
      }
    }

    // Check session after a short delay to let everything initialize
    const timer = setTimeout(() => {
      checkSession()
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Set up refresh interval when we know we have a session
  useEffect(() => {
    if (!hasSession) return

    console.log(
      "SessionRefresher: Setting up session refresh for authenticated user"
    )

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Store current time as last refresh time
    lastRefreshRef.current = Date.now()

    // Set up a new refresh interval - every 10 minutes
    refreshIntervalRef.current = setInterval(async () => {
      try {
        // Skip if we refreshed very recently (within last minute)
        // This prevents excessive refreshes if user has multiple tabs open
        if (Date.now() - lastRefreshRef.current < 60000) {
          return
        }

        // Ensure we're in a browser context
        if (typeof window === "undefined") return

        const supabase = createClient()
        console.log("SessionRefresher: Refreshing session...")

        const { data, error } = await supabase.auth.refreshSession()

        if (error) {
          console.error("SessionRefresher: Error refreshing session:", error)
          setHasSession(false)
          return
        }

        if (data?.session) {
          console.log(
            "SessionRefresher: Session refreshed successfully, expires at:",
            data.session.expires_at
              ? new Date(data.session.expires_at * 1000).toLocaleString()
              : "unknown"
          )

          // Update last refresh time
          lastRefreshRef.current = Date.now()

          // Ensure persistence metadata is set
          await supabase.auth.updateUser({
            data: {
              persistent: true,
              remember_me: true,
            },
          })
        } else {
          console.log("SessionRefresher: No session returned from refresh")
          setHasSession(false)
        }
      } catch (e) {
        console.error("SessionRefresher: Exception during session refresh:", e)
      }
    }, 10 * 60 * 1000) // Refresh every 10 minutes

    // Cleanup on unmount or when session status changes
    return () => {
      if (refreshIntervalRef.current) {
        console.log("SessionRefresher: Cleaning up refresh interval")
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, [hasSession])

  // This component doesn't render anything
  return null
}
