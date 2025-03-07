"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function SessionPersistence() {
  const router = useRouter()

  useEffect(() => {
    // Check for auth hash in URL (implicit flow)
    const handleHashChange = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (data?.session) {
        console.log("Session detected:", data.session)

        // Check if there's a remember me preference in localStorage
        const rememberMe = localStorage.getItem("rememberMe")

        if (rememberMe === "true") {
          try {
            // Update the user data to mark the session as persistent
            await supabase.auth.updateUser({
              data: { persistent: true },
            })

            console.log("Session persistence updated successfully")

            // Clean up the localStorage item
            localStorage.removeItem("rememberMe")
          } catch (error) {
            console.error("Error updating session persistence:", error)
          }
        }

        // Refresh the page to ensure the UI reflects the authenticated state
        router.refresh()
      } else if (error) {
        console.error("Error getting session:", error)
      }
    }

    // Run once on mount to check for hash params
    handleHashChange()

    // Set up a listener for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        console.log("User signed in:", session)
        // Refresh the page to ensure the UI reflects the authenticated state
        router.refresh()
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out")
        // Refresh the page to ensure the UI reflects the unauthenticated state
        router.refresh()
      }
    })

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null
}
