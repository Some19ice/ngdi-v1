"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"
import { useAuthSession } from "@/hooks/use-auth-session"

interface SignInContentProps {
  initiallyAuthenticated?: boolean
}

export function SignInContent({
  initiallyAuthenticated = false,
}: SignInContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const returnUrl = searchParams?.get("from") || "/"

  // Use our unified authentication hook
  const { login, isLoggingIn, navigate, isAuthenticated } = useAuthSession()

  // Clean the return URL to avoid redirection loops
  const safeReturnUrl =
    returnUrl && returnUrl !== "/auth/signin" ? returnUrl : "/"

  // Check if we're already authenticated and redirect if needed
  useEffect(() => {
    if (initiallyAuthenticated || isAuthenticated) {
      console.log(
        "User is already authenticated, redirecting to:",
        safeReturnUrl
      )

      // Add a direct check for cookie existence to double-verify authentication
      const hasAuthCookie = document.cookie.includes("auth_token")
      if (!hasAuthCookie) {
        console.log(
          "No auth cookie found despite authenticated state, waiting for session refresh"
        )
        return // Don't redirect if the cookie is missing
      }

      // Force a router refresh to update UI state
      router.refresh()

      // Delay redirect to ensure state is properly updated
      const redirectTimer = setTimeout(() => {
        console.log(`Executing redirect to ${safeReturnUrl}`)

        if (safeReturnUrl === "/auth/signin") {
          // Avoid redirection loops by going to home
          console.log("Avoiding redirect loop, going to home instead")
          router.push("/")
        } else {
          router.push(safeReturnUrl)
        }
      }, 200)

      return () => clearTimeout(redirectTimer)
    }
  }, [initiallyAuthenticated, isAuthenticated, safeReturnUrl, router])

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required")
      return
    }

    if (isLoggingIn) {
      return // Prevent multiple submission attempts
    }

    setIsLoading(true)

    try {
      // Use the async login function for better error handling
      await login({ email, password })

      // The navigation will be handled by the useEffect
    } catch (error: any) {
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
              disabled={isLoggingIn || isLoading}
              onClick={handleLogin}
            >
              {isLoggingIn || isLoading ? "Signing in..." : "Sign in"}
            </Button>
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
