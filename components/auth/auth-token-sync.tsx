"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * This component syncs localStorage tokens to cookies when needed
 * It helps with cross-domain authentication issues
 */
export function AuthTokenSync() {
  const router = useRouter()

  useEffect(() => {
    // Function to check if we need to sync tokens
    const checkAndSyncTokens = () => {
      // Check if we have tokens in localStorage
      const accessToken = localStorage.getItem("accessToken")
      const refreshToken = localStorage.getItem("refreshToken")
      const isAuthenticated = localStorage.getItem("authenticated") === "true"

      // Always sync tokens if they exist in localStorage
      if (accessToken && refreshToken && isAuthenticated) {
        console.log("Syncing tokens from localStorage to cookies...")

        // Call the sync endpoint to set cookies from localStorage tokens
        fetch("/api/auth/sync-tokens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken,
            refreshToken,
          }),
          credentials: "include",
        })
          .then((response) => {
            if (response.ok) {
              console.log("Token sync successful")
              // No need to refresh the page, just update the cookie check
              document.cookie = "token_synced=true; path=/; max-age=60;"
            } else {
              console.error("Token sync failed")
              if (response.status === 401) {
                // If unauthorized, clear localStorage
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("authenticated")
                console.log("Cleared invalid tokens from localStorage")
              }
            }
          })
          .catch((error) => {
            console.error("Token sync error:", error)
          })
      } else if (document.cookie.includes("auth_token") && !accessToken) {
        // If we have cookies but no localStorage tokens, extract from cookies
        console.log(
          "Found auth cookies but no localStorage tokens, extracting..."
        )

        // Call the API to get the current user
        fetch("/api/auth/me", {
          credentials: "include",
        })
          .then((response) => {
            if (response.ok) {
              return response.json()
            }
            throw new Error("Failed to get user data")
          })
          .then((data) => {
            if (data.success && data.data) {
              console.log("Successfully extracted user data from cookies")
              // We don't have the tokens, but we can mark as authenticated
              localStorage.setItem("authenticated", "true")
            }
          })
          .catch((error) => {
            console.error("Failed to extract user data:", error)
          })
      }
    }

    // Run on mount
    checkAndSyncTokens()

    // Check for x-check-auth cookie
    const checkForAuthCookie = () => {
      if (document.cookie.includes("x-check-auth=true")) {
        console.log("Found x-check-auth cookie, syncing tokens")
        checkAndSyncTokens()
        // Clear the cookie
        document.cookie = "x-check-auth=; path=/; max-age=0;"
      }
    }

    // Check immediately and then every second
    checkForAuthCookie()
    const cookieInterval = setInterval(checkForAuthCookie, 1000)

    // Also run when the X-Check-Auth header is present
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "x-check-auth"
        ) {
          checkAndSyncTokens()
        }
      }
    })

    // Start observing
    observer.observe(document.documentElement, { attributes: true })

    // Also run periodically to ensure tokens stay in sync
    const syncInterval = setInterval(checkAndSyncTokens, 30000) // Every 30 seconds

    // Cleanup
    return () => {
      observer.disconnect()
      clearInterval(syncInterval)
      clearInterval(cookieInterval)
    }
  }, [router])

  return null
}

export default AuthTokenSync
