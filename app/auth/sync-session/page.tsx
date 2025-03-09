"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export default function SyncSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("Initializing...")

  useEffect(() => {
    let mounted = true

    const handleSync = async () => {
      try {
        const code = searchParams?.get("code")
        if (!code) {
          throw new Error("No authentication code found")
        }

        if (mounted) {
          setMessage("Establishing session...")
        }

        // Use the code to authenticate with your custom auth system
        // This is a placeholder - you'll need to implement the actual code exchange
        // in your auth-client.ts file
        try {
          // Assuming you have a method to exchange code for session
          // If not, you'll need to implement this in auth-client.ts
          await authClient.exchangeCodeForSession(code)
          
          if (mounted) {
            setMessage("Authentication successful!")
          }
          
          // Get the return URL or default to home
          const returnTo = searchParams?.get("from") || "/"
          
          // Avoid redirect loops
          const finalRedirect = returnTo === "/auth/signin" ? "/" : returnTo
          
          // Short delay to show success message
          setTimeout(() => {
            if (mounted) {
              window.location.href = finalRedirect
            }
          }, 1000)
        } catch (error) {
          throw new Error("Failed to establish session")
        }
      } catch (error) {
        console.error("Auth error:", error)
        if (mounted) {
          setMessage(
            error instanceof Error ? error.message : "Authentication failed"
          )

          // Show error message briefly before redirecting
          setTimeout(() => {
            if (mounted) {
              window.location.href = "/auth/signin"
            }
          }, 2000)
        }
      }
    }

    handleSync()

    return () => {
      mounted = false
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">{message}</h1>
        <div className="mt-4">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  )
}
