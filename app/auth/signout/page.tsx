"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function ForceSignoutPage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Function to manually clean everything
  const forceCleanup = () => {
    try {
      // Set manual signout flag
      localStorage.setItem("manual_signout", "true")

      // Clear localStorage items
      const authKeys = [
        "supabase.auth.token",
        "supabase.auth.refreshToken",
        "supabase.auth.user",
        "supabase.auth.expires",
        "supabase.auth.data",
        "next-auth.session-token",
        "next-auth.callback-url",
        "next-auth.csrf-token",
      ]

      authKeys.forEach((key) => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.error(`Error removing ${key} from localStorage:`, e)
        }
      })

      // Clear sessionStorage
      try {
        sessionStorage.clear()
      } catch (e) {
        console.error("Error clearing sessionStorage:", e)
      }

      // Clear cookies
      const cookiesToClear = [
        "sb-access-token",
        "sb-refresh-token",
        "next-auth.session-token",
        "next-auth.callback-url",
        "next-auth.csrf-token",
      ]

      cookiesToClear.forEach((name) => {
        document.cookie = `${name}=; Max-Age=-1; path=/;`
      })

      // Handle Supabase project-specific cookies
      const cookies = document.cookie.split(";")
      for (const cookie of cookies) {
        const [name] = cookie.trim().split("=")
        if (
          name &&
          (name.includes("-auth-token") ||
            name.includes("supabase") ||
            name.includes("sb-"))
        ) {
          document.cookie = `${name}=; Max-Age=-1; path=/;`
        }
      }

      return true
    } catch (e) {
      console.error("Error in forceCleanup:", e)
      return false
    }
  }

  const handleNormalSignOut = async () => {
    try {
      setIsSigningOut(true)
      setError(null)
      await signOut()
      setSuccess(true)
    } catch (error) {
      console.error("Error signing out:", error)
      setError("Normal sign-out failed. Try the force sign-out option.")
      setIsSigningOut(false)
    }
  }

  const handleForceSignOut = async () => {
    try {
      setIsSigningOut(true)
      setError(null)

      // First try calling the API endpoint
      try {
        await fetch("/api/auth/signout", {
          method: "POST",
          credentials: "include",
        })
      } catch (apiError) {
        console.error("API signout failed:", apiError)
        // Continue anyway
      }

      // Then forcibly clean up all auth data
      forceCleanup()

      setSuccess(true)

      // Force reload after a delay
      setTimeout(() => {
        window.location.href = "/auth/signin?signedout=true"
      }, 2000)
    } catch (error) {
      console.error("Error with force sign out:", error)
      setError(
        "Force sign-out failed. Please try clearing your browser cookies manually."
      )
      setIsSigningOut(false)
    }
  }

  // Automatically run cleanup if URL has a force parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("force") === "true") {
      handleForceSignOut()
    }
  }, [])

  if (success) {
    return (
      <div className="container mx-auto max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle>Sign Out Successful</CardTitle>
            <CardDescription>
              You have been successfully signed out.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/auth/signin")}
              className="w-full"
            >
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Sign Out</CardTitle>
          <CardDescription>
            Choose how you want to sign out of your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
          <div className="space-y-2">
            <Button
              variant="default"
              className="w-full"
              onClick={handleNormalSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Out...
                </>
              ) : (
                "Normal Sign Out"
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Standard sign-out process that ends your current session.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleForceSignOut}
              disabled={isSigningOut}
            >
              Force Sign Out
            </Button>
            <p className="text-xs text-muted-foreground">
              Force removal of all authentication data from your browser. Use
              this if you're having problems signing out normally.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
