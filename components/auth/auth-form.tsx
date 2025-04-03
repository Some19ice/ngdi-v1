"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { AuthLoadingButton } from "@/components/ui/auth-loading"
import { useAuthSession } from "@/hooks/use-auth-session"
import { ensureCsrfToken } from "@/lib/utils/csrf-utils"
import { UserAuthErrorMessages } from "@/lib/auth/error-messages"
import { getCookie, hasCookie, setCookie } from "@/lib/utils/cookie-utils"
import { getCSRFToken } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordInput } from "@/components/ui/password-input"

// Form schema for validation
const formSchema = z.object({
  email: z.string().email(UserAuthErrorMessages.INVALID_EMAIL),
  password: z.string().min(1, UserAuthErrorMessages.REQUIRED_FIELD),
  rememberMe: z.boolean().default(false)
})

type FormValues = z.infer<typeof formSchema>

interface AuthFormProps {
  initialAuthenticated?: boolean
  mode: "signin" | "signup"
  redirectPath?: string
  title?: string
  description?: string
}

export function AuthForm({
  initialAuthenticated = false,
  mode = "signin",
  redirectPath = "/dashboard",
  title,
  description,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { login, isLoggingIn, isAuthenticated } = useAuthSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Default titles and descriptions based on mode
  const formTitle = title || (mode === "signin" ? "Sign In" : "Create Account")
  const formDescription = description || (
    mode === "signin" 
      ? "Enter your credentials to access your account" 
      : "Fill out the form below to create your account"
  )

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath)
    }
  }, [isAuthenticated, router, redirectPath])

  // Setup form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  })

  // Load remembered email if available
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      form.setValue("email", rememberedEmail)
      form.setValue("rememberMe", true)
    }
  }, [form])

  // Check for error parameter in URL
  useEffect(() => {
    const errorCode = searchParams?.get("error")
    if (errorCode) {
      const errorMessage = UserAuthErrorMessages[errorCode] || UserAuthErrorMessages.DEFAULT
      setError(errorMessage)
    }
  }, [searchParams])

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null)
      
      // Ensure CSRF token is available first
      await ensureCsrfToken()
      
      // Remember email if requested
      if (values.rememberMe) {
        localStorage.setItem("rememberedEmail", values.email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }
      
      // Call the login function from useAuthSession hook
      await login({ 
        email: values.email, 
        password: values.password 
      })
      
      // If login successful, redirect will happen via the useEffect
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || UserAuthErrorMessages.SERVER_ERROR)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
        <CardDescription>{formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      type="email" 
                      autoComplete="email" 
                      disabled={isLoggingIn}
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        autoComplete="current-password"
                        disabled={isLoggingIn}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoggingIn}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                  </FormItem>
                )}
              />
              
              {mode === "signin" && (
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                mode === "signin" ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  )
} 