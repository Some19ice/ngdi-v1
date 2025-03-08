"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export function AuthHandler() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

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
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          toast({
            title: "Session Error",
            description: "Failed to retrieve session",
            variant: "destructive",
          })
          router.push("/auth/signin")
          return
        }

        if (session) {
          // Get the redirect URL from query params or default to dashboard
          const redirectTo = params?.get("redirect") || "/dashboard"

          // Update user metadata if needed
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              last_sign_in: new Date().toISOString(),
            },
          })

          if (updateError) {
            console.error("Error updating user metadata:", updateError)
          }

          toast({
            title: "Welcome back!",
            description: "You have been successfully signed in.",
          })

          router.push(redirectTo)
        } else {
          router.push("/auth/signin")
        }
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
  }, [router, params, toast, supabase.auth])

  return null
}
