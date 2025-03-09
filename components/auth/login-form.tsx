"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

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
import { useSession } from "@/hooks/use-session"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const { login, isLoggingIn, isAuthenticated } = useSession()
  const [showPassword, setShowPassword] = useState(false)

  // Get return URL from query params
  const returnUrl = params?.get("returnUrl") || "/"

  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl)
    }
  }, [isAuthenticated, router, returnUrl])

  // Handle form submission
  async function onSubmit(data: LoginFormValues) {
    try {
      // Store remember me preference
      if (data.rememberMe) {
        localStorage.setItem("rememberMe", "true")
        localStorage.setItem("rememberedEmail", data.email)
      } else {
        localStorage.removeItem("rememberMe")
        localStorage.removeItem("rememberedEmail")
      }

      // Login
      await login({ email: data.email, password: data.password })

      // Redirect will happen automatically in the useEffect
    } catch (error: any) {
      console.error("Login error:", error)
      // Error handling is done in the useSession hook
    }
  }

  // Load remembered email if available
  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe") === "true"
    const rememberedEmail = localStorage.getItem("rememberedEmail")

    if (rememberMe && rememberedEmail) {
      form.setValue("email", rememberedEmail)
      form.setValue("rememberMe", true)
    }
  }, [form])

  // Check for error in URL
  useEffect(() => {
    const error = params?.get("error")
    if (error) {
      toast({
        title: "Authentication Error",
        description:
          error === "CredentialsSignin"
            ? "Invalid email or password"
            : "An error occurred during sign in",
        variant: "destructive",
      })
    }
  }, [params, toast])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                      placeholder="your.email@example.com"
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
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
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
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
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
                    <FormLabel className="text-sm font-normal">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Button
                variant="link"
                className="px-0 font-normal"
                type="button"
                onClick={() => router.push("/auth/reset-password")}
                disabled={isLoggingIn}
              >
                Forgot password?
              </Button>
            </div>
            <AuthLoadingButton
              type="submit"
              className="w-full"
              isLoading={isLoggingIn}
              loadingText="Signing in..."
            >
              Sign In
            </AuthLoadingButton>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button
            variant="link"
            className="p-0 font-normal"
            onClick={() => router.push("/register")}
            disabled={isLoggingIn}
          >
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
