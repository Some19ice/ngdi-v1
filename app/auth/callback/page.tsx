"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { toast } from "sonner"
import {
  hasManualSignOutFlag,
  clearManualSignOutFlag,
  hasRememberMeFlag,
  enforceSessionPersistence,
} from "@/lib/auth/session-utils"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if user manually signed out before proceeding
        const wasManualSignOut = hasManualSignOutFlag()

        if (wasManualSignOut) {
          console.log(
            "Auth callback: User manually signed out, redirecting to sign in page"
          )
          clearManualSignOutFlag()
          router.push("/auth/signin?signedout=true")
          return
        }

        const code = searchParams?.get("code")
        if (!code) {
          console.error("No code found in URL")
          toast.error("Authentication failed")
          router.push("/auth/signin")
          return
        }

        console.log("Exchanging code for session")
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error("Error exchanging code for session:", error)
          toast.error("Authentication failed")
          router.push("/auth/signin")
          return
        }

        if (data.session) {
          console.log("Session established successfully")

          // Ensure manual sign-out flag is cleared on successful login
          clearManualSignOutFlag()

          // Check if remember me was set before the OAuth flow started
          const shouldRemember = hasRememberMeFlag()
          console.log("Remember me flag is set:", shouldRemember)

          if (shouldRemember) {
            // Apply session persistence if remember me was enabled
            try {
              console.log("Enforcing session persistence after OAuth login")
              await enforceSessionPersistence()

              // Also update user metadata
              await supabase.auth.updateUser({
                data: {
                  persistent: true,
                  remember_me: true,
                },
              })
              console.log("User metadata updated for persistence")
            } catch (persistError) {
              console.error("Error setting session persistence:", persistError)
              // Continue anyway as this is not critical
            }
          }

          const returnTo = searchParams?.get("from") || "/"
          router.push(returnTo === "/auth/signin" ? "/" : returnTo)
        } else {
          console.error("No session data received")
          toast.error("Authentication failed")
          router.push("/auth/signin")
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
