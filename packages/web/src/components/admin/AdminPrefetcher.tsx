"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Prefetches common admin data to improve perceived performance
 * This component should be included in the admin layout
 */
export function AdminPrefetcher() {
  const pathname = usePathname()

  useEffect(() => {
    // Function to prefetch data
    const prefetchData = async () => {
      try {
        // Only prefetch data when we're on the admin dashboard
        if (pathname === "/admin" || pathname === "/admin/dashboard") {
          console.log("Prefetching admin dashboard data...")

          // Get the API base URL from env
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
          if (!apiUrl) {
            console.warn("API URL is not configured, skipping prefetch")
            return
          }

          // Get auth token from cookies
          const authToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("auth_token="))
            ?.split("=")[1]

          if (!authToken) {
            console.warn("No auth token found for API prefetching")
            return
          }

          // Prefetch common data used in the admin dashboard
          const endpoints = [
            "/dashboard-stats",
            "/stats",
            "/users?page=1&limit=10",
            "/metadata?page=1&limit=10",
          ]

          // Create a cache-busting timestamp
          const cacheBuster = new Date().getTime()

          // Use Promise.all to fetch data in parallel
          await Promise.all(
            endpoints.map((endpoint) =>
              fetch(
                `${apiUrl}/api/admin${endpoint}${endpoint.includes("?") ? "&" : "?"}_=${cacheBuster}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                    "x-prefetch": "true",
                    // Prevent caching
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                  },
                }
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(
                      `Failed to prefetch ${endpoint}: ${response.status} ${response.statusText}`
                    )
                  }
                  return response
                })
                .catch((error) => {
                  console.error(`Error prefetching ${endpoint}:`, error)
                  // Continue with other prefetches even if one fails
                  return null
                })
            )
          )

          console.log("Admin data prefetched successfully")
        }
      } catch (error) {
        console.error("Error prefetching admin data:", error)
        // Non-critical error, so we don't need to handle it further
      }
    }

    // Start prefetching after a short delay to allow the page to render first
    const timer = setTimeout(() => {
      prefetchData()
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname])

  // This component doesn't render anything
  return null
}

export default AdminPrefetcher
