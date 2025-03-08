"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { signIn } from "next-auth/react"
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

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
})

type SignInValues = z.infer<typeof signInSchema>

interface AuthError {
  message: string
  type?: "error" | "warning" | "info"
  actions?: {
    label: string
    onClick: () => void
  }[]
}

function SignInForm() {
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams?.get("callbackUrl") || "/"

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
        redirect: false,
        callbackUrl,
      })

      if (!result?.ok || result?.error) {
        setError({
          message: result?.error || "Invalid email or password",
          type: "error",
        })
        return
      }

      // Redirect to callback URL or home page
      router.push(callbackUrl)
    } catch (error) {
      console.error("Sign in error:", error)
      setError({
        message: "An unexpected error occurred. Please try again later.",
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

      await signIn("google", {
        callbackUrl,
      })
    } catch (error) {
      console.error("Google sign in error:", error)
      setError({
        message: "An error occurred with Google sign in. Please try again.",
        type: "error",
      })
      setIsGoogleLoading(false)
    }
  }

  const getErrorStyles = (type: AuthError["type"] = "error") => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 text-yellow-600 border-yellow-200"
      case "info":
        return "bg-blue-50 text-blue-600 border-blue-200"
      default:
        return "bg-red-50 text-red-600 border-red-200"
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
              <Alert
                className={`${getErrorStyles(
                  error.type
                )} p-3 text-sm border rounded-md`}
                role="alert"
                aria-live="assertive"
              >
                <div className="flex flex-col gap-2">
                  <p>{error.message}</p>
                  {error.actions && error.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {error.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={action.onClick}
                          className="text-xs py-0 h-7"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
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

            <Button
              type="submit"
              className="w-full"
              disabled={isEmailLoading}
            >
              {isEmailLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In with Email
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
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full"
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign in with Google
            </Button>
          </form>
        </Form>
      </FocusTrap>
    </div>
  )
}

export default function SignInPage() {
  return <SignInForm />
} 