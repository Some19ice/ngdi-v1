"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get("error")
  const from = searchParams.get("from")
  const callbackUrl = (() => {
    if (from === "/login" || from === "%2Flogin") return "/metadata"
    try {
      return from ? decodeURIComponent(from) : "/metadata"
    } catch {
      return "/metadata"
    }
  })()

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await signIn("google", { 
        callbackUrl,
        redirect: false 
      })
      
      if (result?.error) {
        switch (result.error) {
          case "AccessDenied":
            setError("Your account doesn't have access to this application")
            break
          case "EmailNotVerified":
            setError("Please verify your email address first")
            break
          default:
            setError("An error occurred during sign in")
        }
        return
      }
      
      router.push(callbackUrl)
    } catch (error) {
      setError("An unexpected error occurred")
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        <Button
          onClick={handleSignIn}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in with Google"
          )}
        </Button>
      </Card>
    </div>
  )
} 