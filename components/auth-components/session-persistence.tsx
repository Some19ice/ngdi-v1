"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function SessionPersistence() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Important: First check if we can actually use localStorage
    let canUseStorage = false
    try {
      const testKey = "supabase-storage-test"
      localStorage.setItem(testKey, "test")
      localStorage.removeItem(testKey)
      canUseStorage = true
    } catch (e) {
      console.error("LocalStorage not available:", e)
      // Can't use storage - exit early
      return
    }

    if (!canUseStorage) return

    // Check if user manually signed out
    const wasManualSignOut = localStorage.getItem("manual_signout") === "true"

    // Check for signedout URL parameter
    const signedOut = searchParams?.get("signedout") === "true"

    console.log("SessionPersistence init:", {
      wasManualSignOut,
      signedOut,
      pathname,
    })

    if (wasManualSignOut) {
      console.log(
        "SessionPersistence: User manually signed out, not persisting session"
      )
      return
    }

    // Skip auto-login on sign-in and other auth pages when signed out
    if (signedOut && pathname?.includes("/auth/")) {
      console.log(
        "SessionPersistence: On auth page after signout, not persisting session"
      )
      return
    }

    // Function to enforce session persistence
    const enforceSessionPersistence = async () => {
      try {
        // Get current session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data?.session) {
          console.log("Session detected, checking persistence")

          // Check if there's a remember me preference in localStorage
          const rememberMe = localStorage.getItem("remember_me") === "true"

          if (rememberMe) {
            try {
              // Set persistence explicitly
              await supabase.auth.updateUser({
                data: {
                  persistent: true,
                  remember_me: true,
                },
              })

              // Force session refresh to ensure persistence is properly applied
              await supabase.auth.setSession({
                access_token: data.session.access_token || "",
                refresh_token: data.session.refresh_token || "",
              })

              console.log("Session persistence reinforced")
            } catch (error) {
              console.error("Error enforcing session persistence:", error)
            }
          }

          // Only refresh if not on auth pages or after sign-out
          if (!(signedOut && pathname?.includes("/auth/"))) {
            // Refresh the page to ensure the UI reflects the authenticated state
            router.refresh()
          }
        } else {
          console.log("No session detected")
        }
      } catch (error) {
        console.error("Session persistence error:", error)
      }
    }

    // Run session persistence enforcement
    if (!wasManualSignOut && !(signedOut && pathname?.includes("/auth/"))) {
      enforceSessionPersistence()
    }

    // Set up a listener for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Check if the user manually signed out before processing auth events
      const wasManualSignOut = localStorage.getItem("manual_signout") === "true"
      const signedOut = searchParams?.get("signedout") === "true"

      console.log("Auth state change in SessionPersistence:", {
        event,
        hasSession: !!session,
        wasManualSignOut,
        signedOut,
        pathname,
      })

      if (event === "SIGNED_IN" && !wasManualSignOut) {
        console.log("User signed in, ensuring persistence")

        // Clear manual signout flag immediately
        localStorage.removeItem("manual_signout")

        // Check if remember me is set
        const rememberMe = localStorage.getItem("remember_me") === "true"
        if (rememberMe && session) {
          try {
            // Ensure persistent session
            await supabase.auth.updateUser({
              data: {
                persistent: true,
                remember_me: true,
              },
            })

            // Make the session persistent by explicitly setting it
            await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            })

            console.log("Session persistence explicitly set on sign in")
            toast.success("Signed in successfully", { id: "signin-success" })
          } catch (error) {
            console.error("Error setting persistence:", error)
          }
        }

        // Refresh the page to ensure the UI reflects the authenticated state
        router.refresh()
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out")
        // Refresh the page to ensure the UI reflects the unauthenticated state
        router.refresh()
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed")
        // Re-apply persistence settings on token refresh
        const rememberMe = localStorage.getItem("remember_me") === "true"
        if (rememberMe && session) {
          try {
            await supabase.auth.updateUser({
              data: {
                persistent: true,
                remember_me: true,
              },
            })
          } catch (error) {
            console.error("Error re-applying persistence:", error)
          }
        }
        // Refresh the UI state with the new token
        router.refresh()
      }
    })

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname, searchParams])

  return null
}
