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

          // Prefetch common data used in the admin dashboard
          const endpoints = [
            "/api/admin/dashboard-stats",
            "/api/admin/stats",
            "/api/admin/users?page=1&limit=10",
            "/api/admin/metadata?page=1&limit=10",
          ]

          // Use Promise.all to fetch data in parallel
          await Promise.all(
            endpoints.map((endpoint) =>
              fetch(endpoint, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  // Add a cache-busting parameter to ensure we get fresh data
                  "x-prefetch": "true",
                },
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
