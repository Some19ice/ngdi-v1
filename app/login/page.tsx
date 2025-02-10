"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { Suspense } from "react"

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const returnUrl = searchParams.get("from")
      router.push(returnUrl || "/")
    }
  }, [session?.user, status, router, searchParams])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[350px] text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    )
  }

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      const returnUrl = searchParams.get("from")
      const callbackUrl = returnUrl || "/"

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      })

      if (!result?.error) {
        toast.success("Successfully signed in!")
        router.push(callbackUrl)
      } else {
        toast.error("Invalid email or password")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-4">
      <div className="w-full max-w-[350px] space-y-4">
        <div className="flex flex-col space-y-1.5 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to access your account
          </p>
        </div>

        <Card>
          <CardContent className="pt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your email"
                            className="pl-9"
                            {...field}
                          />
                        </div>
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
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              <a
                className="hover:text-primary underline underline-offset-4"
                href="/register"
              >
                Don&apos;t have an account? Sign up
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              <a
                className="hover:text-primary underline underline-offset-4"
                href="/forgot-password"
              >
                Forgot password?
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
