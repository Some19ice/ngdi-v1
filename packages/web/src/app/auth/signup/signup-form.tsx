"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef } from "react"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import Captcha from "@/components/auth/captcha"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import Link from "next/link"

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignUpValues = z.infer<typeof signUpSchema>

export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register: authRegister, navigate } = useSupabaseAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<any>(null)

  // Feature flag for CAPTCHA
  const enableCaptcha = process.env.NEXT_PUBLIC_ENABLE_CAPTCHA === "true"

  // Get return URL from query parameters
  const returnUrl = searchParams ? searchParams.get("returnUrl") || "/" : "/"

  // Create a wrapper around the register function
  const register = async (email: string, password: string) => {
    return authRegister(email, password, form.getValues().name)
  }

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: SignUpValues) {
    // Check if CAPTCHA is enabled and verify token
    if (enableCaptcha && !captchaToken) {
      setError("Please complete the CAPTCHA verification")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`Attempting to register user: ${data.email}`)

      // In a real implementation, we would pass the captchaToken to the register function
      if (enableCaptcha && captchaToken) {
        console.log("Using CAPTCHA token for registration:", captchaToken)
      }

      await register(data.email, data.password)

      console.log("Registration successful, redirecting to:", returnUrl)

      // Small delay to ensure cookies are set
      setTimeout(() => {
        navigate(returnUrl)
      }, 500)
    } catch (error: any) {
      console.error("Sign up error:", error)

      // Extract a more user-friendly error message
      let errorMessage = "Registration failed. Please try again."

      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.name === "RegistrationError") {
        errorMessage = error.toString()
      }

      setError(errorMessage)

      // Reset CAPTCHA if enabled
      if (enableCaptcha && captchaRef.current) {
        setCaptchaToken(null)
        // In a real implementation, we would call the CAPTCHA reset method
        console.log("Resetting CAPTCHA after failed registration")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to create a new account
        </p>
      </div>

      <FocusTrap>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2">
                {error}
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              type="submit"
              className="w-full"
              disabled={isLoading || (enableCaptcha && !captchaToken)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
        </Form>
      </FocusTrap>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
