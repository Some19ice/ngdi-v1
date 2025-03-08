"use client"

import { useEffect, useRef } from "react"
import {
  enforceSessionPersistence,
  hasRememberMeFlag,
} from "@/lib/auth/session-utils"
import { createClient } from "@/lib/supabase-client"

/**
 * This component should be included in the root layout to ensure
 * session persistence is enforced on every page load
 */
export function PersistentAuth() {
  // Track if we've done the initial enforcement
  const initialEnforcementDone = useRef(false)
  // Track failures for exponential backoff
  const failureCount = useRef(0)

  useEffect(() => {
    // Only enforce persistence if remember me flag is set
    if (typeof window !== "undefined" && hasRememberMeFlag()) {
      console.log(
        "PersistentAuth: Remember me is active - enforcing session persistence"
      )

      // First attempt immediately if not done yet
      if (!initialEnforcementDone.current) {
        console.log("PersistentAuth: Running initial session enforcement")

        // Try to get the session to validate it's still active
        const checkAndEnforce = async () => {
          try {
            const supabase = createClient()
            const { data } = await supabase.auth.getSession()

            if (data?.session) {
              console.log(
                "PersistentAuth: Found active session, enforcing persistence"
              )
              await enforceSessionPersistence()
              initialEnforcementDone.current = true
              failureCount.current = 0 // Reset failures on success
            } else {
              console.log(
                "PersistentAuth: No active session found despite remember me flag"
              )

              // Try to refresh session if possible
              try {
                const { data: refreshData } =
                  await supabase.auth.refreshSession()
                if (refreshData?.session) {
                  console.log("PersistentAuth: Session refreshed successfully")
                  await enforceSessionPersistence()
                  initialEnforcementDone.current = true
                  failureCount.current = 0
                }
              } catch (refreshError) {
                console.error("Error refreshing session:", refreshError)
                failureCount.current++
              }
            }
          } catch (e) {
            console.error(
              "PersistentAuth: Error checking/enforcing session:",
              e
            )
            failureCount.current++
          }
        }

        checkAndEnforce()
      }

      // Then set up an interval to periodically check and enforce with exponential backoff for failures
      const intervalId = setInterval(async () => {
        // Skip if remember me is no longer active
        if (!hasRememberMeFlag()) {
          console.log(
            "PersistentAuth: Remember me flag no longer active, skipping enforcement"
          )
          return
        }

        try {
          const supabase = createClient()
          const { data } = await supabase.auth.getSession()

          if (data?.session) {
            console.log(
              "PersistentAuth: Periodic check - enforcing session persistence"
            )
            await enforceSessionPersistence()
            failureCount.current = 0 // Reset failures on success
          } else {
            console.log(
              "PersistentAuth: Periodic check - no active session found"
            )
          }
        } catch (e) {
          console.error("PersistentAuth: Error in periodic enforcement:", e)
          failureCount.current++
        }
      }, (60 + failureCount.current * 30) * 1000) // Increase interval with failures

      // Clean up interval on unmount
      return () => clearInterval(intervalId)
    } else {
      console.log(
        "PersistentAuth: Remember me is not active, skipping session enforcement"
      )
    }
  }, [])

  // This component doesn't render anything
  return null
}
