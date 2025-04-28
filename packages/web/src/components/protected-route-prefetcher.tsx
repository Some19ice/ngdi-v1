"use client"

import { useState, useEffect } from "react"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { createClient } from "@/lib/supabase-client"

/**
 * This component optimizes protected route loading by prefetching
 * authentication state and commonly needed data.
 *
 * It should be included in the layout.tsx file so it's always present.
 */
export function ProtectedRoutePrefetcher() {
  const { isAuthenticated } = useSupabaseAuth()
  const [prefetched, setPrefetched] = useState(false)

  // Prefetch authentication data when component mounts
  useEffect(() => {
    // Skip if we've already prefetched or we're not authenticated yet
    if (prefetched || !isAuthenticated) return

    const prefetchData = async () => {
      try {
        console.log("Prefetching data for protected routes...")

        // Ensure authentication is already validated to avoid extra validation
        // This is non-blocking and happens in parallel
        const supabase = createClient()
        const authPromise = supabase.auth.getSession()

        // Wait for authentication to complete, but proceed
        // even if it fails to avoid blocking the UI
        await Promise.race([
          authPromise,
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ])

        setPrefetched(true)
      } catch (error) {
        console.error("Failed to prefetch data:", error)
      }
    }

    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => prefetchData(), { timeout: 2000 })
    } else {
      setTimeout(prefetchData, 500)
    }
  }, [isAuthenticated, prefetched])

  // This component doesn't render anything
  return null
}

// Add TypeScript declaration for requestIdleCallback
declare global {
  interface Window {
    requestIdleCallback: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number
  }
}
