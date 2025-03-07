"use client"

import { useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase-client"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function AuthHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleAuthStateChange = useCallback(
    async (event: string, session: any) => {
      console.log("Auth state change:", {
        event,
        hasSession: !!session,
        currentPath: pathname,
      })

      try {
        switch (event) {
          case "SIGNED_IN": {
            // Get the return URL or default to home
            const returnTo = searchParams?.get("from") || "/"
            const finalRedirect = returnTo === "/auth/signin" ? "/" : returnTo

            console.log("Sign in successful, redirecting to:", finalRedirect)
            router.push(finalRedirect)
            break
          }

          case "SIGNED_OUT": {
            console.log("Sign out detected, redirecting to signin")
            router.push("/auth/signin")
            break
          }

          case "USER_UPDATED": {
            console.log("User data updated")
            router.refresh()
            break
          }
        }
      } catch (error) {
        console.error("Auth state change error:", error)
        toast.error("Authentication error occurred")
      }
    },
    [router, pathname, searchParams]
  )

  useEffect(() => {
    const handleSession = async () => {
      try {
        // Handle PKCE callback
        if (pathname === "/auth/callback") {
          const code = searchParams?.get("code")
          if (code) {
            console.log("Processing auth callback")
            const { data, error } = await supabase.auth.exchangeCodeForSession(
              code
            )

            if (error) {
              console.error("Auth callback error:", error)
              toast.error("Authentication failed")
              router.push("/auth/signin")
              return
            }

            if (data.session) {
              console.log("Session established successfully")
              const returnTo = searchParams?.get("from") || "/"
              router.push(returnTo === "/auth/signin" ? "/" : returnTo)
              return
            }
          }
        }

        // Check current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Current auth state:", {
          hasSession: !!session,
          currentPath: pathname,
        })

        // Redirect to home if authenticated and on auth pages
        if (
          session &&
          (pathname === "/auth/signin" || pathname === "/auth/callback")
        ) {
          router.push("/")
        }
      } catch (error) {
        console.error("Session handling error:", error)
        toast.error("Failed to initialize session")
      }
    }

    handleSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      subscription.unsubscribe()
    }
  }, [handleAuthStateChange, pathname, searchParams, router, supabase.auth])

  return null
}
