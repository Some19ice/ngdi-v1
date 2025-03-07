"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert } from "@/components/ui/alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FocusTrap } from "@/components/ui/focus-trap"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth/auth-context"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
})

type SignInValues = z.infer<typeof signInSchema>

interface AuthError {
  message: string
  type?: "error" | "warning" | "info"
}

function SignInForm() {
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, userRole, isLoading } = useAuth()
  const from = searchParams?.get("from") || null
  const callbackUrl = (() => {
    if (from === "/login" || from === "%2Flogin") return "/"
    try {
      return from ? decodeURIComponent(from) : "/"
    } catch {
      return "/"
    }
  })()

  // Check if user is already authenticated
  useEffect(() => {
    if (user && userRole && !isLoading) {
      console.log(
        "SignIn: User already authenticated, redirecting to:",
        callbackUrl
      )
      // Use window.location for a full page reload
      window.location.href = callbackUrl
    }
  }, [user, userRole, isLoading, callbackUrl])

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const handleCredentialsSignIn = async (data: SignInValues) => {
    try {
      setIsEmailLoading(true)
      setError(null)

      console.log("SignIn: Signing in with Supabase:", {
        email: data.email,
        rememberMe: data.rememberMe,
      })

      // Use Supabase auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })

      if (authError) {
        console.error("Supabase auth error:", authError)

        // Handle different error types more specifically
        switch (authError.status) {
          case 400:
            setError({
              message: "Invalid email or password",
              type: "error",
            })
            break
          case 401:
            setError({
              message:
                "Invalid credentials. Please check your email and password",
              type: "error",
            })
            break
          case 422:
            setError({
              message:
                "Email not verified. Please check your inbox for a verification email",
              type: "warning",
            })
            break
          case 429:
            setError({
              message: "Too many sign-in attempts. Please try again later",
              type: "error",
            })
            break
          default:
            // Check for specific error messages
            if (authError.message.includes("Email not confirmed")) {
              setError({
                message: "Please verify your email address before signing in",
                type: "warning",
              })
            } else if (
              authError.message.includes("Invalid login credentials")
            ) {
              setError({
                message: "Invalid email or password",
                type: "error",
              })
            } else {
              setError({
                message: `Authentication error: ${authError.message}`,
                type: "error",
              })
            }
        }
        return
      }

      console.log("SignIn: Sign in successful, redirecting to:", callbackUrl)

      // If remember me is checked, update session persistence
      if (data.rememberMe && authData.session) {
        // We can't directly set the expiry, but we can update the session
        // to persist it in localStorage instead of sessionStorage
        await supabase.auth.updateUser({
          data: { persistent: true },
        })
      }

      // Redirect after successful login - use window.location for a full page reload
      window.location.href = callbackUrl
    } catch (error) {
      console.error("Detailed sign in error:", error)
      // Handle network or unexpected errors
      setError({
        message:
          "Connection error. Please check your internet connection and try again",
        type: "error",
      })
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setError(null)

      console.log("Starting Google sign in with Supabase...")

      // Get the remember me value from the form
      const rememberMe = form.getValues("rememberMe") || false

      // Store the remember me preference in localStorage for use after redirect
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
      }

      // Use Supabase OAuth with PKCE flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline", // Request a refresh token
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Supabase OAuth error:", error)

        // Handle different OAuth error types
        if (error.message.includes("popup")) {
          setError({
            message: "Popup was blocked. Please allow popups for this site",
            type: "warning",
          })
        } else if (error.message.includes("network")) {
          setError({
            message:
              "Network error. Please check your connection and try again",
            type: "error",
          })
        } else {
          setError({
            message: `Authentication failed: ${error.message}`,
            type: "error",
          })
        }
        return
      }

      // For OAuth, Supabase handles the redirect automatically
      console.log("OAuth initiated:", data)
    } catch (error) {
      console.error("Detailed sign in error:", error)
      setError({
        message: "Failed to initialize Google sign in. Please try again",
        type: "error",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const getErrorStyles = (type: AuthError["type"] = "error") => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 text-yellow-600"
      case "info":
        return "bg-blue-50 text-blue-600"
      default:
        return "bg-red-50 text-red-600"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FocusTrap>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCredentialsSignIn)}
            className="max-w-md mx-auto space-y-6"
            aria-label="Sign in form"
            noValidate
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Sign In</h1>
              <p className="text-muted-foreground">
                Enter your email to sign in to your account
              </p>
            </div>

            {error && (
              <Alert className={`${getErrorStyles(error.type)} p-3 text-sm`}>
                {error.message}
              </Alert>
            )}

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        required
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Remember me</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isEmailLoading}>
              {isEmailLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In with Email"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="github"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isGoogleLoading ? "Signing In..." : "Sign In with Google"}
            </Button>
          </form>
        </Form>
      </FocusTrap>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
} 