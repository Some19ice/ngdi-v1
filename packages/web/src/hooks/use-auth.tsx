"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useCallback } from "react"
import { toast as sonnerToast } from "sonner"
import authService, { Session, User, LoginCredentials, RegisterCredentials, AuthError } from "@/lib/auth/auth-service"
import AUTH_CONFIG from "@/lib/auth/auth-config"
import { UserRole } from "@/lib/auth/constants"

// Query keys
const SESSION_QUERY_KEY = ["session"]

/**
 * Authentication hook for handling user authentication
 * @returns Authentication state and methods
 */
export function useAuth() {
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
  } = useQuery<Session | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => authService.getSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchOnMount: true,
  })

  // Convert React Query status to auth status
  const status = isLoading
    ? "loading"
    : session
    ? "authenticated"
    : "unauthenticated"

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await authService.login(credentials)
    },
    onSuccess: (data) => {
      // Invalidate the session query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      
      // Show success toast
      toast({
        title: "Success",
        description: "You have been signed in successfully",
      })
    },
    onError: (error: AuthError) => {
      // Show error toast
      toast({
        title: "Error",
        description: error.message || AUTH_CONFIG.ERROR_MESSAGES.INVALID_CREDENTIALS,
        variant: "destructive",
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      return await authService.register(credentials)
    },
    onSuccess: (data) => {
      // Invalidate the session query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      
      // Show success toast
      toast({
        title: "Success",
        description: "Your account has been created successfully",
      })
    },
    onError: (error: AuthError) => {
      // Show error toast
      toast({
        title: "Error",
        description: error.message || AUTH_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
        variant: "destructive",
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await authService.logout()
    },
    onSuccess: () => {
      // Invalidate the session query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      
      // Show success toast
      toast({
        title: "Success",
        description: "You have been signed out successfully",
      })
      
      // Redirect to home page
      router.push("/")
    },
    onError: (error: AuthError) => {
      // Show error toast
      toast({
        title: "Error",
        description: error.message || AUTH_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
        variant: "destructive",
      })
    },
  })

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      // Perform the refresh
      await authService.refreshSession()
      
      // Invalidate the session query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      
      return true
    } catch (error) {
      console.error("Failed to refresh session:", error)
      return false
    }
  }, [queryClient])

  // Navigation helper
  const navigate = useCallback(
    (path: string) => {
      router.push(path)
    },
    [router]
  )

  // Helper functions for role checking
  const user = session?.user || null
  const isAuthenticated = !!user

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user) return false
      const roles = Array.isArray(role) ? role : [role]
      return roles.includes(user.role)
    },
    [user]
  )

  const isAdmin = user?.role === UserRole.ADMIN
  const isNodeOfficer = user?.role === UserRole.NODE_OFFICER || isAdmin

  // Return a unified API
  return {
    // Session state
    session,
    user,
    isLoading,
    isError,
    error,
    status,
    isAuthenticated,

    // Role helpers
    hasRole,
    isAdmin,
    isNodeOfficer,

    // Auth methods
    login: loginMutation.mutateAsync,
    loginSync: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,

    logout: logoutMutation.mutateAsync,
    logoutSync: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    register: registerMutation.mutateAsync,
    registerSync: registerMutation.mutate,
    isRegistering: registerMutation.isPending,

    refreshSession,

    // Navigation helper
    navigate,
  }
}

export default useAuth
