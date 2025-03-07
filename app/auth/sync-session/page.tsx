"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

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

        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          throw error
        }

        if (!data.session) {
          throw new Error("No session established")
        }

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
