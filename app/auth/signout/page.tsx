"use client"

import { useState, useEffect, useCallback } from "react"
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

  // Function to forcibly clean up all auth data
  const forceCleanup = useCallback(() => {
    try {
      // Clear all auth-related localStorage items
      localStorage.removeItem("auth_tokens")
      localStorage.removeItem("auth_session")
      localStorage.removeItem("auth_user")
      localStorage.removeItem("auth_remember_me")
      localStorage.removeItem("auth_manual_signout")

      // Clear all auth-related cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(
            /=.*/,
            `=;expires=${new Date().toUTCString()};path=/;domain=${
              window.location.hostname
            }`
          )
      })

      console.log("Force cleanup completed")
      return true
    } catch (error) {
      console.error("Force cleanup error:", error)
      return false
    }
  }, [])

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

  const handleForceSignOut = useCallback(async () => {
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

      // Set success state
      setSuccess(true)
      setIsSigningOut(false)
    } catch (error) {
      console.error("Force sign out error:", error)
      setError("Failed to sign out. Please try again.")
      setIsSigningOut(false)
    }
  }, [forceCleanup])

  // Automatically run cleanup if URL has a force parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("force") === "true") {
      handleForceSignOut()
    }
  }, [handleForceSignOut])

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
              this if you&apos;re having problems signing out normally.
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
