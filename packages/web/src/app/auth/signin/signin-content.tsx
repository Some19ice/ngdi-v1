"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Captcha from "@/components/auth/captcha"
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
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<any>(null)
  const returnUrl = searchParams?.get("from") || "/"

  // Feature flag for CAPTCHA
  const enableCaptcha = process.env.NEXT_PUBLIC_ENABLE_CAPTCHA === "true"

  // Use our Supabase authentication hook
  const {
    login,
    isLoading: isLoggingIn,
    navigate,
    isAuthenticated,
  } = useSupabaseAuth()

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
      const hasAuthCookie = document.cookie.includes("sb-access-token")
      if (!hasAuthCookie) {
        console.log(
          "No Supabase auth cookie found despite authenticated state, waiting for session refresh"
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

    // Check if CAPTCHA is enabled and verify token
    if (enableCaptcha && !captchaToken) {
      toast.error("Please complete the CAPTCHA verification")
      return
    }

    setIsLoading(true)

    try {
      // Use the Supabase login function with CAPTCHA token if enabled
      if (enableCaptcha && captchaToken) {
        // In a real implementation, we would pass the captchaToken to the login function
        console.log("Using CAPTCHA token for login:", captchaToken)
        await login(email, password, rememberMe)
      } else {
        await login(email, password, rememberMe)
      }

      // The navigation will be handled by the useEffect
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to sign in. Please check your credentials."

      toast.error(errorMessage)

      // Reset CAPTCHA if enabled
      if (enableCaptcha && captchaRef.current) {
        setCaptchaToken(null)
        // In a real implementation, we would call the CAPTCHA reset method
        console.log("Resetting CAPTCHA after failed login")
      }
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

            {/* CAPTCHA component (conditionally rendered based on feature flag) */}
            {enableCaptcha && (
              <div className="flex justify-center">
                <Captcha
                  sitekey="10000000-ffff-ffff-ffff-000000000001" // Replace with your actual sitekey
                  onVerify={(token) => setCaptchaToken(token)}
                />
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              disabled={
                isLoggingIn || isLoading || (enableCaptcha && !captchaToken)
              }
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
