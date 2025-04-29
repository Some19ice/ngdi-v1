"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { toast as sonnerToast } from "sonner" // For compatibility with existing code
import { 
  AuthSession, 
  AuthUser, 
  AuthState, 
  AuthError, 
  AuthErrorCode,
  LoginRequest,
  RegisterRequest,
  isAuthenticated,
  mapSupabaseSession,
  mapSupabaseUser
} from "@/lib/auth/auth-types"
import { 
  isAdmin, 
  isNodeOfficer, 
  hasAnyRole, 
  hasPermission,
  getUserPermissions
} from "@/lib/auth/role-guards"
import { UserRole } from "@/lib/auth/constants"
import { 
  AUTH_QUERY_KEYS, 
  DEFAULT_STALE_TIME, 
  DEFAULT_CACHE_TIME,
  DEFAULT_REFETCH_INTERVAL,
  DEFAULT_REFETCH_ON_WINDOW_FOCUS,
  DEFAULT_RETRY_COUNT,
  setSessionData,
  getSessionData
} from "@/lib/auth/query-config"
import {
  storeSessionInCookies,
  clearSessionCookies,
  getSessionFromCookies,
  hasSessionCookies,
  isSessionExpired
} from "@/lib/auth/cookie-manager"
import {
  cacheUserMetadata,
  getCachedUserMetadata,
  clearCachedUserMetadata
} from "@/lib/auth/metadata-cache"
import { supabaseAuthConfig } from "@/lib/auth/supabase-auth.config"

// Global state to prevent navigation conflicts
const authGlobals = {
  isNavigating: false,
  lastNavigationTimestamp: 0,
  lastSessionRefreshTimestamp: 0,
}

/**
 * Enhanced hook for authentication session management
 * This hook provides a unified interface for authentication state and methods
 * @returns Authentication state and methods
 */
export function useAuthSession() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  // Query for session data with enhanced caching
  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
    status: queryStatus,
  } = useQuery<AuthSession | null, AuthError>({
    queryKey: AUTH_QUERY_KEYS.session,
    queryFn: async () => {
      try {
        // First check cookies for a cached session
        const cachedSession = getSessionFromCookies()
        
        // If we have a cached session and it's not expired, use it
        if (cachedSession && cachedSession.user && cachedSession.accessToken) {
          // Check if we have more complete user data in the metadata cache
          const cachedUser = getCachedUserMetadata(cachedSession.user.id)
          
          if (cachedUser) {
            return {
              ...cachedSession,
              user: cachedUser,
            } as AuthSession
          }
          
          return cachedSession as AuthSession
        }
        
        // Otherwise, fetch from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw {
            message: error.message,
            code: AuthErrorCode.UNKNOWN_ERROR,
            status: 500,
          }
        }

        if (!data.session) return null

        // Map Supabase session to our AuthSession type
        const authSession = mapSupabaseSession(data.session)
        
        // Cache the session data
        storeSessionInCookies(authSession)
        cacheUserMetadata(authSession.user)
        
        return authSession
      } catch (error: any) {
        console.error("Error fetching session:", error)
        
        // Map error to our AuthError type
        throw {
          message: error.message || "Failed to fetch session",
          code: error.code || AuthErrorCode.UNKNOWN_ERROR,
          status: error.status || 500,
        }
      }
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: DEFAULT_RETRY_COUNT,
    refetchOnWindowFocus: DEFAULT_REFETCH_ON_WINDOW_FOCUS,
    refetchInterval: DEFAULT_REFETCH_INTERVAL,
    refetchOnMount: true,
  })

  // Derived state
  const user = session?.user || null
  const authState: AuthState = isLoading
    ? { status: "loading", user: null, session: null, error: null }
    : isError
    ? { 
        status: "error", 
        user: null, 
        session: null, 
        error: error || { 
          message: "Unknown error", 
          code: AuthErrorCode.UNKNOWN_ERROR 
        } 
      }
    : session
    ? { status: "authenticated", user: session.user, session, error: null }
    : { status: "unauthenticated", user: null, session: null, error: null }

  // Navigation helper with anti-flicker protection
  const navigate = useCallback(
    (path: string) => {
      if (authGlobals.isNavigating) return
      
      // Set navigation flag to prevent multiple navigations
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

  // Login mutation with enhanced error handling and caching
  const loginMutation = useMutation<
    AuthSession,
    AuthError,
    LoginRequest
  >({
    mutationFn: async ({ email, password, rememberMe = false }) => {
      // Show loading toast for better UX
      const loadingToast = toast({
        title: "Signing in...",
        description: "Verifying your credentials",
      })

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            // Set remember me option for longer session
            ...(rememberMe && {
              sessionDurationSeconds: supabaseAuthConfig.session.rememberMeAge,
            }),
          },
        })

        if (error) {
          throw {
            message: error.message,
            code: AuthErrorCode.INVALID_CREDENTIALS,
            status: 401,
          }
        }

        if (!data.session) {
          throw {
            message: "No session returned from authentication",
            code: AuthErrorCode.UNKNOWN_ERROR,
            status: 500,
          }
        }

        // Map Supabase session to our AuthSession type
        const authSession = mapSupabaseSession(data.session)
        
        // Store session in cookies and cache
        storeSessionInCookies(authSession, rememberMe)
        cacheUserMetadata(authSession.user)
        
        // Store remember me preference
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("remember_me", rememberMe ? "true" : "false")
        }
        
        return authSession
      } catch (error: any) {
        console.error("Login error:", error)
        
        // Map error to our AuthError type
        throw {
          message: error.message || "Invalid email or password",
          code: error.code || AuthErrorCode.INVALID_CREDENTIALS,
          status: error.status || 401,
          details: error.details,
        }
      } finally {
        // Clear loading toast
        loadingToast.dismiss?.()
      }
    },
    onSuccess: (newSession) => {
      // Update query cache immediately
      setSessionData(queryClient, newSession)

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

      // Navigate to dashboard or requested page
      const redirectUrl = 
        typeof localStorage !== "undefined" && localStorage.getItem("redirectUrl")
          ? localStorage.getItem("redirectUrl")
          : "/dashboard"
      
      if (redirectUrl) {
        navigate(redirectUrl)
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("redirectUrl")
        }
      }
    },
    onError: (error: AuthError) => {
      // Create a user-friendly error message
      let errorMessage = error.message || "Invalid email or password. Please try again."
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

  // Register mutation with enhanced error handling
  const registerMutation = useMutation<
    void,
    AuthError,
    RegisterRequest
  >({
    mutationFn: async ({
      email,
      password,
      name,
      organization,
      department,
      phone,
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
              role: UserRole.USER, // Default role
              organization,
              department,
              phone,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/verify`,
          },
        })

        if (error) {
          throw {
            message: error.message,
            code: AuthErrorCode.EMAIL_ALREADY_EXISTS,
            status: 400,
          }
        }

        if (!data.user) {
          throw {
            message: "Failed to create user",
            code: AuthErrorCode.UNKNOWN_ERROR,
            status: 500,
          }
        }
      } catch (error: any) {
        console.error("Registration error:", error)
        
        // Map error to our AuthError type
        throw {
          message: error.message || "Failed to create account",
          code: error.code || AuthErrorCode.UNKNOWN_ERROR,
          status: error.status || 500,
          details: error.details,
        }
      } finally {
        // Clear loading toast
        loadingToast.dismiss?.()
      }
    },
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })

      // For sonner toast compatibility
      sonnerToast.success("Account created! Please check your email.")

      // Navigate to verification page
      navigate(supabaseAuthConfig.pages.verifyRequest)
    },
    onError: (error: AuthError) => {
      // Create a user-friendly error message
      let errorMessage = error.message || "Failed to create account. Please try again."
      let errorTitle = "Registration failed"

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

  // Logout mutation
  const logoutMutation = useMutation<void, AuthError>({
    mutationFn: async () => {
      try {
        // Set manual signout flag to prevent auto-login
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("manual_signout", "true")
        }

        const { error } = await supabase.auth.signOut()

        if (error) {
          throw {
            message: error.message,
            code: AuthErrorCode.UNKNOWN_ERROR,
            status: 500,
          }
        }

        // Clear session data from cache and cookies
        clearCachedUserMetadata()
        clearSessionCookies()
      } catch (error: any) {
        console.error("Logout error:", error)
        
        // Map error to our AuthError type
        throw {
          message: error.message || "Failed to sign out",
          code: error.code || AuthErrorCode.UNKNOWN_ERROR,
          status: error.status || 500,
        }
      }
    },
    onSuccess: () => {
      // Clear session data from query cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.session, null)
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, null)

      // Show success toast
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })

      // For sonner toast compatibility
      sonnerToast.success("Signed out successfully")

      // Navigate to home page
      navigate("/")

      // Force a router refresh to update UI
      router.refresh()
    },
    onError: (error: AuthError) => {
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

  // Session refresh function with optimized caching
  const refreshSession = useCallback(async () => {
    try {
      // Check if we've refreshed recently to prevent excessive refreshes
      const now = Date.now()
      const timeSinceLastRefresh = now - authGlobals.lastSessionRefreshTimestamp
      
      if (timeSinceLastRefresh < 10000) { // 10 seconds
        console.debug("Skipping refresh, last refresh was too recent")
        return
      }
      
      authGlobals.lastSessionRefreshTimestamp = now

      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error refreshing session:", error)
        return
      }

      if (data.session) {
        // Map Supabase session to our AuthSession type
        const authSession = mapSupabaseSession(data.session)
        
        // Update the session in the cache
        setSessionData(queryClient, authSession)
        
        // Update cookies and metadata cache
        storeSessionInCookies(authSession)
        cacheUserMetadata(authSession.user)

        // Log successful refresh
        console.debug("Session refreshed successfully")
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
      // Fallback to refetch
      await refetch()
    }
  }, [queryClient, refetch, supabase.auth])

  // Auth action wrappers
  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      return loginMutation.mutateAsync({
        email,
        password,
        rememberMe,
      })
    },
    [loginMutation]
  )

  const register = useCallback(
    async (
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
    },
    [registerMutation]
  )

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  // Synchronous versions of auth methods for compatibility
  const loginSync = useCallback(
    (email: string, password: string, rememberMe = false) => {
      loginMutation.mutate({
        email,
        password,
        rememberMe,
      })
    },
    [loginMutation]
  )

  const registerSync = useCallback(
    (
      email: string,
      password: string,
      name?: string,
      organization?: string,
      department?: string,
      phone?: string
    ) => {
      registerMutation.mutate({
        email,
        password,
        name,
        organization,
        department,
        phone,
      })
    },
    [registerMutation]
  )

  const logoutSync = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

  // Return the auth state and methods
  return {
    // Auth state
    session,
    user,
    status: authState.status,
    error: authState.error,
    isAuthenticated: isAuthenticated(authState),
    
    // Loading states
    isLoading,
    isError,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    
    // Auth methods
    login,
    register,
    logout,
    refreshSession,
    
    // Synchronous versions for compatibility
    loginSync,
    registerSync,
    logoutSync,
    
    // Role-based helpers
    hasRole: hasAnyRole,
    isAdmin: () => isAdmin(user),
    isNodeOfficer: () => isNodeOfficer(user),
    
    // Permission helpers
    hasPermission: (permission) => hasPermission(user, permission),
    getUserPermissions: () => getUserPermissions(user),
    
    // Navigation helper
    navigate,
  }
}

// Export the hook as the default export
export default useAuthSession
