"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { toast } from "sonner"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams?.get("code")
        if (!code) {
          console.error("No code found in URL")
          toast.error("Authentication failed")
          router.push("/auth/signin")
          return
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error("Error exchanging code for session:", error)
          toast.error("Authentication failed")
          router.push("/auth/signin")
          return
        }

        if (data.session) {
          console.log("Session established successfully")
          const returnTo = searchParams?.get("from") || "/"
          router.push(returnTo === "/auth/signin" ? "/" : returnTo)
        }
      } catch (error) {
        console.error("Error in auth callback:", error)
        toast.error("Authentication failed")
        router.push("/auth/signin")
      }
    }

    handleCallback()
  }, [router, searchParams, supabase.auth])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Completing sign in...</h1>
        <p className="mt-2 text-muted-foreground">
          Please wait while we verify your credentials.
        </p>
      </div>
    </div>
  )
}
