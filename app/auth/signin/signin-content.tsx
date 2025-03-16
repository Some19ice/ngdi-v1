"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

export function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const returnUrl = searchParams?.get("from") || "/"

  const handleLogin = async () => {
    if (!email || !password) {
      setDebugInfo("Email and password are required")
      return
    }

    setIsLoading(true)
    setDebugInfo("Starting login process...")

    try {
      console.log(`Attempting to sign in with email: ${email}`)
      setDebugInfo(`Calling authClient.login with email: ${email}...`)

      const session = await authClient.login(email, password, rememberMe)

      setDebugInfo(
        `Sign-in successful, session received. User role: ${session.user?.role}`
      )
      console.log("Sign-in successful, session:", {
        hasUser: !!session.user,
        userRole: session.user?.role,
        expires: session.expires,
      })

      toast.success("Signed in successfully")

      // Small delay to ensure cookies are set
      setDebugInfo("Setting timeout for redirect...")
      setTimeout(async () => {
        // Verify that the session is properly set by checking with the server
        try {
          const response = await fetch("/api/auth/check", {
            method: "GET",
            credentials: "include",
          })

          const authCheck = await response.json()
          setDebugInfo(`Auth check result: ${JSON.stringify(authCheck)}`)

          if (authCheck.authenticated) {
            setDebugInfo(
              `Authentication confirmed, redirecting to ${returnUrl}...`
            )
            router.push(returnUrl)
            router.refresh()
          } else {
            setDebugInfo(
              `Authentication failed after login: ${authCheck.message}`
            )
            toast.error(
              "Login succeeded but session was not established. Please try again."
            )
          }
        } catch (checkError) {
          console.error("Auth check error:", checkError)
          setDebugInfo(`Auth check error: ${checkError}`)
          // Still redirect even if the check fails
          router.push(returnUrl)
          router.refresh()
        }
      }, 1000) // Increased timeout to ensure cookies are set
    } catch (error: any) {
      console.error("Login failed:", error)

      // Extract and display detailed error information
      const errorDetail = error.response?.data
        ? JSON.stringify(error.response.data)
        : "No response data"
      const errorStatus = error.response?.status || "No status"
      setDebugInfo(
        `Login failed: ${error.message || "Unknown error"}\nStatus: ${errorStatus}\nDetails: ${errorDetail}`
      )

      // Extract error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to sign in. Please check your credentials."

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")
    setDebugInfo("Form submitted, starting login...")
    await handleLogin()
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/auth/reset-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={isLoading}
              onClick={handleLogin}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            {debugInfo && (
              <div className="mt-4 p-2 bg-gray-100 text-xs text-gray-800 rounded overflow-auto max-h-32">
                <pre>{debugInfo}</pre>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            Don&apos;t have an account?{" "}
            <a href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
