# Authentication Refactoring: Code Samples

This document provides code samples for implementing Supabase Auth in the NGDI Portal. These samples demonstrate the key patterns and approaches that should be used during the refactoring.

## Supabase Client Setup

### Client-Side Supabase Client

```typescript
// packages/web/src/lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'
import { AUTH_CONFIG } from './auth/config'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        cookies: {
          name: AUTH_CONFIG.cookies.prefix,
          lifetime: AUTH_CONFIG.cookies.maxAge,
          domain: AUTH_CONFIG.cookies.domain,
          sameSite: AUTH_CONFIG.cookies.sameSite,
          secure: AUTH_CONFIG.cookies.secure,
          path: AUTH_CONFIG.cookies.path,
        }
      }
    }
  )
}
```

### Server-Side Supabase Client

```typescript
// packages/web/src/lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'
import { AUTH_CONFIG } from './auth/config'

export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### API Supabase Admin Client

```typescript
// packages/api/src/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Create a Supabase client with admin privileges for server-side operations
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

## Authentication Hook

```typescript
// packages/web/src/hooks/use-auth-session.ts
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Session, User, UserRole } from '@/lib/auth/types'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/use-toast'

// Query key for session data
export const SESSION_QUERY_KEY = ['auth', 'session']

// Global state to prevent navigation conflicts
const authGlobals = {
  isNavigating: false,
}

/**
 * Enhanced hook for session management using Supabase Auth
 * @returns Authentication state and methods
 */
export function useAuthSession() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  // Query for session data
  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
    status: queryStatus,
  } = useQuery<Session | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchOnMount: true,
  })

  // Derived state
  const user = session?.user || null
  const isAuthenticated = !!session?.user
  const status = isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated'

  // Role-based helpers
  const hasRole = useCallback((role: UserRole | UserRole[]) => {
    if (!user?.role) return false
    return Array.isArray(role) ? role.includes(user.role) : user.role === role
  }, [user])

  const isAdmin = useCallback(() => hasRole(UserRole.ADMIN), [hasRole])
  const isNodeOfficer = useCallback(() => hasRole(UserRole.NODE_OFFICER), [hasRole])

  // Navigation helper
  const navigate = useCallback((path: string) => {
    if (authGlobals.isNavigating) return
    authGlobals.isNavigating = true
    router.push(path)
  }, [router])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data.session
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, data)
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string
      password: string
      name?: string
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: UserRole.USER,
          },
        },
      })
      if (error) throw error
      return data
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null)
    },
  })

  // Auth action wrappers
  const login = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password })
    return result
  }

  const register = async (email: string, password: string, name?: string) => {
    await registerMutation.mutateAsync({ email, password, name })
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const refreshSession = async () => {
    await refetch()
  }

  return {
    session,
    status,
    login,
    register,
    logout,
    refreshSession,
    user,
    isAuthenticated,
    hasRole,
    isAdmin,
    isNodeOfficer,
    navigate,
    isLoading,
    isError,
    error,
  }
}
```

## API Authentication Middleware

```typescript
// packages/api/src/middleware/auth.middleware.ts
import { Next } from "hono"
import { Context } from "../types/hono.types"
import { UserRole } from "../types/auth.types"
import { AuthError, AuthErrorCode } from "../types/error.types"
import { supabaseAdmin } from "../lib/supabase-admin"
import { securityLogService, SecurityEventType } from "../services/security-log.service"
import { logger } from "../lib/logger"

/**
 * Authentication middleware that validates Supabase Auth tokens
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    // Get client information for logging
    const clientInfo = {
      ipAddress:
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        c.req.header("cf-connecting-ip") ||
        "unknown",
      userAgent: c.req.header("user-agent") || "unknown",
      deviceId: c.req.header("x-device-id") || "unknown",
    }

    // Get token from request (header or cookie)
    const authHeader = c.req.header("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "No authentication token provided",
        401
      )
    }

    const token = authHeader.replace("Bearer ", "")

    // Validate the token with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !data.user) {
      // Log validation failure
      await securityLogService.logTokenValidationFailure(
        token,
        error?.message || "Invalid token",
        clientInfo
      )
      
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        error?.message || "Invalid token",
        401
      )
    }

    // Get user role from metadata
    const role = data.user.user_metadata?.role || UserRole.USER

    // Set user in context
    c.set("user", {
      id: data.user.id,
      email: data.user.email || "",
      role,
      emailVerified: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
    })

    // Log successful authentication
    logger.debug(`User authenticated: ${data.user.email}`, {
      userId: data.user.id,
      role,
    })

    await next()
  } catch (error) {
    // Handle errors
    if (error instanceof AuthError) {
      throw error
    }

    // Handle other errors
    logger.error("Authentication middleware error:", error)
    throw new AuthError(
      AuthErrorCode.SERVER_ERROR,
      "Authentication failed",
      500
    )
  }
}

/**
 * Middleware to require admin role
 */
export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get("user")

  if (!user) {
    throw new AuthError(
      AuthErrorCode.UNAUTHORIZED,
      "User not found in context",
      401
    )
  }

  // Check if user has ADMIN role
  if (user.role !== UserRole.ADMIN) {
    throw new AuthError(AuthErrorCode.FORBIDDEN, "Admin access required", 403)
  }

  await next()
}

/**
 * Middleware to require a specific role
 */
export function requireRole(role: UserRole | string) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")

    if (!user) {
      throw new AuthError(
        AuthErrorCode.UNAUTHORIZED,
        "User not found in context",
        401
      )
    }

    // Check role
    if (user.role === role) {
      await next()
      return
    }

    // Admin users have access to everything
    if (user.role === UserRole.ADMIN) {
      await next()
      return
    }

    throw new AuthError(
      AuthErrorCode.FORBIDDEN,
      "Insufficient permissions",
      403
    )
  }
}

/**
 * Middleware to require email verification
 */
export async function requireEmailVerification(c: Context, next: Next) {
  const user = c.get("user")

  if (!user) {
    throw new AuthError(
      AuthErrorCode.UNAUTHORIZED,
      "User not found in context",
      401
    )
  }

  // Check if user's email is verified
  if (!user.emailVerified) {
    logger.info(`Access blocked - email not verified: ${user.email}`, {
      userId: user.id,
      email: user.email,
    })

    throw new AuthError(
      AuthErrorCode.EMAIL_NOT_VERIFIED,
      "Email verification required. Please verify your email before proceeding.",
      403,
      {
        requiresVerification: true,
        email: user.email,
      }
    )
  }

  // Email is verified, proceed
  await next()
}
```

## Protected Route Component

```typescript
// packages/web/src/components/auth/protected-route.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserRole } from "@/lib/auth/constants"
import { useAuthSession } from "@/hooks/use-auth-session"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  fallback?: React.ReactNode
}

/**
 * A component that protects routes by checking authentication and role-based access
 * @param children The content to render if the user is authorized
 * @param allowedRoles Optional array of roles that are allowed to access the route
 * @param fallback Optional fallback component to render while checking authorization
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  fallback = (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ),
}: ProtectedRouteProps) {
  const { session, isLoading, status } = useAuthSession()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Check authentication
    if (!isLoading) {
      const isAuthenticated = !!session?.user

      if (!isAuthenticated) {
        // User is not authenticated, redirect to login
        router.push(AUTH_CONFIG.pages.signIn)
        setAuthorized(false)
        return
      }

      // Check role-based access if roles are specified
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = session.user.role
        const hasRequiredRole = allowedRoles.includes(userRole as UserRole)

        if (!hasRequiredRole) {
          // User doesn't have the required role, redirect to unauthorized
          router.push(AUTH_CONFIG.pages.error)
          setAuthorized(false)
          return
        }
      }

      // User is authenticated and has the required role
      setAuthorized(true)
    }
  }, [isLoading, session, router, allowedRoles])

  // Show fallback while loading or if not authorized
  if (isLoading || !authorized) {
    return <>{fallback}</>
  }

  // Show children if authorized
  return <>{children}</>
}

export default ProtectedRoute
```

## Next.js Middleware

```typescript
// packages/web/src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { UserRole } from "./lib/auth/constants"
import { AUTH_PATHS, PROTECTED_ROUTES, ADMIN_ROUTES, NODE_OFFICER_ROUTES } from "./lib/auth/paths"
import { logger } from "./lib/logger"

// Helper function to check if a path matches any of the routes
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (route === path) return true
    // Path starts with route and is followed by / or end of string
    if (path.startsWith(route + "/")) return true
    // Route has a wildcard
    if (route.endsWith("*") && path.startsWith(route.slice(0, -1))) return true
    return false
  })
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Create Supabase client for auth
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })
    
    // Refresh session if available
    const { data: { session } } = await supabase.auth.getSession()

    // Check if this is a protected route that requires authentication
    if (
      matchesRoute(pathname, PROTECTED_ROUTES) ||
      matchesRoute(pathname, ADMIN_ROUTES) ||
      matchesRoute(pathname, NODE_OFFICER_ROUTES)
    ) {
      // No session, redirect to login
      if (!session) {
        logger.info(`Redirecting unauthenticated user from protected route: ${pathname}`)
        return NextResponse.redirect(new URL(AUTH_PATHS.SIGNIN, request.url))
      }

      // Get user role from session
      const role = session.user.user_metadata?.role || UserRole.USER

      // Check role-based access for admin routes
      if (matchesRoute(pathname, ADMIN_ROUTES) && role !== UserRole.ADMIN) {
        logger.info(`Redirecting non-admin user from admin route: ${pathname}`)
        return NextResponse.redirect(new URL(AUTH_PATHS.UNAUTHORIZED, request.url))
      }

      // Check role-based access for node officer routes
      if (matchesRoute(pathname, NODE_OFFICER_ROUTES) && 
          role !== UserRole.NODE_OFFICER && 
          role !== UserRole.ADMIN) {
        logger.info(`Redirecting user from node officer route: ${pathname}`)
        return NextResponse.redirect(new URL(AUTH_PATHS.UNAUTHORIZED, request.url))
      }
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (session && (pathname === AUTH_PATHS.SIGNIN || pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of error, allow the request to continue
    return NextResponse.next()
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
```

## Login Form Component

```typescript
// packages/web/src/components/auth/login-form.tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthSession } from "@/hooks/use-auth-session"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuthSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Get return URL from query params
  const returnUrl = searchParams.get("returnUrl") || "/dashboard"

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Form submission handler
  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true)
      
      // Remember email if requested
      if (values.rememberMe) {
        localStorage.setItem("rememberedEmail", values.email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      // Call login function
      await login(values.email, values.password)
      
      // Show success toast
      toast({
        title: "Login successful",
        description: "You have been successfully logged in",
      })
      
      // Redirect to return URL
      router.push(returnUrl)
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Show error toast
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
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
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">Remember me</FormLabel>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  )
}
```

These code samples provide a foundation for implementing Supabase Auth in the NGDI Portal. They should be adapted and extended as needed during the refactoring process.
