"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Session, User } from "@/lib/auth/types"
import { UserRole } from "@/lib/auth/constants"
import { createClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { toast as sonnerToast } from "sonner" // For compatibility with existing code
import { supabaseAuthConfig } from "@/lib/auth/supabase-auth.config"

// Query key for session data
export const SESSION_QUERY_KEY = ["auth", "session"]

// Global state to prevent navigation conflicts
const authGlobals = {
  isNavigating: false,
  lastNavigationTimestamp: 0,
  lastSessionRefreshTimestamp: 0,
}

/**
 * Enhanced hook for session management using Supabase Auth
 * @returns Authentication state and methods
 */
export function useSupabaseAuth() {
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

      if (!data.session) return null

      // Transform Supabase session to our Session type
      return {
        user: {
          id: data.session.user.id,
          email: data.session.user.email || "",
          name: data.session.user.user_metadata?.name || null,
          role: data.session.user.user_metadata?.role || UserRole.USER,
          emailVerified: data.session.user.email_confirmed_at
            ? new Date(data.session.user.email_confirmed_at)
            : null,
        },
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      }
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
  const status = isLoading
    ? "loading"
    : isAuthenticated
      ? "authenticated"
      : "unauthenticated"

  // Role-based helpers
  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user?.role) return false
      return Array.isArray(role)
        ? role.includes(user.role as UserRole)
        : user.role === role
    },
    [user]
  )

  const isAdmin = useCallback(() => hasRole(UserRole.ADMIN), [hasRole])
  const isNodeOfficer = useCallback(
    () => hasRole(UserRole.NODE_OFFICER),
    [hasRole]
  )

  // Navigation helper
  const navigate = useCallback(
    (path: string) => {
      if (authGlobals.isNavigating) return
      authGlobals.isNavigating = true
      authGlobals.lastNavigationTimestamp = Date.now()

      // Clear the flag after a timeout in case something goes wrong
      setTimeout(() => {
        authGlobals.isNavigating = false
      }, 2000)

      router.push(path)
    },
    [router]
  )

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      rememberMe = false,
    }: {
      email: string
      password: string
      rememberMe?: boolean
    }) => {
      // Show loading toast for better UX
      const loadingToast = toast({
        title: "Signing in...",
        description: "Verifying your credentials",
      })

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (!data.session) {
          throw new Error("No session returned from authentication")
        }

        // Transform Supabase session to our Session type
        return {
          user: {
            id: data.session.user.id,
            email: data.session.user.email || "",
            name: data.session.user.user_metadata?.name || null,
            role: data.session.user.user_metadata?.role || UserRole.USER,
            emailVerified: data.session.user.email_confirmed_at
              ? new Date(data.session.user.email_confirmed_at)
              : null,
          },
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        }
      } finally {
        // Clear loading toast
        loadingToast.dismiss?.()
      }
    },
    onSuccess: (newSession) => {
      // Update query cache immediately
      queryClient.setQueryData(SESSION_QUERY_KEY, newSession)

      // Show success toast
      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      })

      // For sonner toast compatibility (used in some components)
      sonnerToast.success("Signed in successfully")

      // Set global auth state
      authGlobals.lastSessionRefreshTimestamp = Date.now()

      // Force an immediate router refresh to update UI based on auth state
      router.refresh()

      // Use a small delay to ensure UI is updated before redirecting
      setTimeout(() => {
        console.log("Login successful - refreshing app state")

        // Force clear any previous navigation locks
        authGlobals.isNavigating = false

        // If we're on the signin page with a valid session, redirect to home
        if (window.location.pathname.includes("/auth/signin")) {
          console.log(
            "Redirecting from signin page to home after successful login"
          )

          // Extract any return URL from query params
          const urlParams = new URLSearchParams(window.location.search)
          const returnUrl = urlParams.get("from") || "/"

          // Navigate to the desired page
          if (returnUrl && returnUrl !== "/auth/signin") {
            router.push(returnUrl)
          } else {
            router.push("/")
          }
        }
      }, 150)
    },
    onError: (error: any) => {
      // Create a user-friendly error message
      let errorMessage =
        error.message || "Invalid email or password. Please try again."
      let errorTitle = "Login failed"

      // Show error toast
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })

      // For sonner toast compatibility
      sonnerToast.error(errorMessage)
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
      organization,
      department,
      phone,
    }: {
      email: string
      password: string
      name?: string
      organization?: string
      department?: string
      phone?: string
    }) => {
      // Show loading toast for better UX
      const loadingToast = toast({
        title: "Creating account...",
        description: "Setting up your account",
      })

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: UserRole.USER,
              organization,
              department,
              phone,
            },
          },
        })

        if (error) throw error

        if (!data.user) {
          throw new Error("No user returned from registration")
        }

        // Return user data
        return {
          id: data.user.id,
          email: data.user.email || "",
          name: name || null,
          role: UserRole.USER,
          emailVerified: null,
          organization: organization || null,
          department: department || null,
          phone: phone || null,
        }
      } finally {
        // Clear loading toast
        loadingToast.dismiss?.()
      }
    },
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      })

      // For sonner toast compatibility
      sonnerToast.success("Account created successfully")

      // Navigate to verification page
      navigate(supabaseAuthConfig.pages.verifyRequest)
    },
    onError: (error: any) => {
      // Show error toast
      toast({
        title: "Registration failed",
        description:
          error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })

      // For sonner toast compatibility
      sonnerToast.error(error.message || "Registration failed")
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Don't set status to loading immediately to prevent UI flicker
      if (!authGlobals.isNavigating) {
        // Mark that we're handling navigation
        authGlobals.isNavigating = true
        authGlobals.lastNavigationTimestamp = Date.now()
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      // Clear query cache
      queryClient.setQueryData(SESSION_QUERY_KEY, null)
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })

      // Show success toast
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })

      // Navigate to login page
      navigate("/auth/signin")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    },
    onSettled: () => {
      // Always release the navigation lock after a timeout
      setTimeout(() => {
        authGlobals.isNavigating = false
      }, 2000)
    },
  })

  // Auth action wrappers
  const login = async (email: string, password: string, rememberMe = false) => {
    const result = await loginMutation.mutateAsync({
      email,
      password,
      rememberMe,
    })
    return result
  }

  const register = async (
    email: string,
    password: string,
    name?: string,
    organization?: string,
    department?: string,
    phone?: string
  ) => {
    await registerMutation.mutateAsync({
      email,
      password,
      name,
      organization,
      department,
      phone,
    })
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const refreshSession = async () => {
    // Implement proactive token refresh
    try {
      // Check if we need to refresh the token
      if (session?.accessToken) {
        // Call the Supabase refresh method
        const { data, error } = await supabase.auth.refreshSession()

        if (error) throw error

        if (data.session) {
          // Update the session in the cache with the new tokens
          queryClient.setQueryData(SESSION_QUERY_KEY, {
            user: {
              id: data.session.user.id,
              email: data.session.user.email || "",
              name: data.session.user.user_metadata?.name || null,
              role: data.session.user.user_metadata?.role || UserRole.USER,
              emailVerified: data.session.user.email_confirmed_at
                ? new Date(data.session.user.email_confirmed_at)
                : null,
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          })

          // Log successful refresh
          console.debug("Session refreshed successfully")
        }
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
      // Fallback to refetch
      await refetch()
    }
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
