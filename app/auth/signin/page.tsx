"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { Loader2, Mail, Chrome } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
  const searchParamsError = searchParams.get("error")
  const from = searchParams.get("from")
  const callbackUrl = (() => {
    if (from === "/login" || from === "%2Flogin") return "/"
    try {
      return from ? decodeURIComponent(from) : "/"
    } catch {
      return "/"
    }
  })()

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
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        switch (result.error) {
          case "AccessDenied":
            setError({
              message: "Your account doesn't have access to this application",
              type: "error",
            })
            break
          case "EmailNotVerified":
            setError({
              message: "Please verify your email address first",
              type: "warning",
            })
            break
          default:
            setError({
              message: "Invalid email or password",
              type: "error",
            })
        }
        return
      }

      router.push(callbackUrl)
    } catch (error) {
      setError({
        message: "An unexpected error occurred",
        type: "error",
      })
      console.error("Sign in error:", error)
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setError(null)
      await signIn("google", {
        callbackUrl,
      })
    } catch (error) {
      setError({
        message: "An unexpected error occurred",
        type: "error",
      })
      console.error("Sign in error:", error)
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
    <div className="flex min-h-screen items-center justify-center">
      <Card className="p-6 w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Choose your preferred sign in method
          </p>
        </div>

        {(error || searchParamsError) && (
          <div
            className={`p-4 rounded-md text-sm ${getErrorStyles(error?.type)}`}
          >
            {error?.message || searchParamsError}
          </div>
        )}

        <div className="grid gap-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full"
            disabled={isGoogleLoading || isEmailLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in with Google...
              </>
            ) : (
              <>
                <Chrome className="mr-2 h-4 w-4" />
                Sign in with Google
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or with email
              </span>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCredentialsSignIn)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
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
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
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
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label
                        htmlFor="rememberMe"
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </Label>
                    </FormItem>
                  )}
                />
                <Button variant="link" className="px-0" asChild>
                  <a href="/auth/forgot-password">Forgot password?</a>
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isEmailLoading || isGoogleLoading}
              >
                {isEmailLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign in with Email
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Button variant="link" className="px-1" asChild>
            <a href="/auth/signup">Sign up</a>
          </Button>
        </div>
      </Card>
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