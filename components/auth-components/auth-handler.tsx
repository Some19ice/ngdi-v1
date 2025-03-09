"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { authClient } from "@/lib/auth-client"
import { useAuth } from "@/lib/auth-context"

export function AuthHandler() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const { refreshSession } = useAuth()

  useEffect(() => {
    const handleAuthState = async () => {
      try {
        // Check for error parameters
        const error = params?.get("error")
        const errorDescription = params?.get("error_description")

        if (error) {
          console.error("Auth error:", error, errorDescription)
          toast({
            title: "Authentication Error",
            description:
              errorDescription || "An error occurred during authentication",
            variant: "destructive",
          })
          router.push("/auth/signin")
          return
        }

        // Check for successful authentication
        const session = await authClient.getSession()

        if (!session) {
          console.error("Session error: No session found")
          toast({
            title: "Session Error",
            description: "Failed to retrieve session",
            variant: "destructive",
          })
          router.push("/auth/signin")
          return
        }

        // Get the redirect URL from query params or default to home
        const redirectTo = params?.get("redirect") || "/"

        // Refresh the session in the auth context
        await refreshSession()

        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        })

        router.push(redirectTo)
      } catch (error) {
        console.error("Auth handler error:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        router.push("/auth/signin")
      }
    }

    handleAuthState()
  }, [router, params, toast, refreshSession])

  return null
}
