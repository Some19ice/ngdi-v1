import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authClient, Session, User } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { UserRole } from "@/lib/auth/constants"
import { useCallback, useEffect } from "react"
import { toast as sonnerToast } from "sonner" // For compatibility with existing code
import { checkApiAvailability } from "@/lib/api-config"

// Query keys
const SESSION_QUERY_KEY = ["session"]

// Add TypeScript declaration for window properties
declare global {
  interface Window {
    __lastSessionRefresh: number
    __authGlobals?: AuthGlobals
  }
}

// Add a global navigation lock to prevent multiple redirects
interface AuthGlobals {
  isNavigating: boolean
  lastNavigationTimestamp: number
  lastSessionRefreshTimestamp: number
}

// Initialize global object in client-side only
const authGlobals: AuthGlobals =
  typeof window !== "undefined"
    ? window.__authGlobals ||
      (window.__authGlobals = {
        isNavigating: false,
        lastNavigationTimestamp: 0,
        lastSessionRefreshTimestamp: 0,
      })
    : {
        isNavigating: false,
        lastNavigationTimestamp: 0,
        lastSessionRefreshTimestamp: 0,
      }

/**
 * Enhanced hook for session management that combines React Query and Context-based auth
 * This is the new primary authentication hook that should be used throughout the app
 * @returns Authentication state and methods
 */
export function useAuthSession() {
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
    queryFn: () => authClient.getSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchOnMount: true,
  })

  // Convert React Query status to auth context status
  const status: "loading" | "authenticated" | "unauthenticated" = isLoading
    ? "loading"
    : session
      ? "authenticated"
      : "unauthenticated"

  // Check for cookie existence - helps detect when browser data is cleared
  const checkCookies = useCallback(() => {
    if (typeof document === "undefined") return true
    const hasAuthCookie = document.cookie.includes("auth_token")
    const hasRefreshCookie = document.cookie.includes("refresh_token")
    return hasAuthCookie || hasRefreshCookie
  }, [])

  // Handle navigation with anti-flicker measures
  const navigate = useCallback(
    (path: string) => {
      // Check if already navigating to prevent multiple redirects
      if (typeof window !== "undefined" && authGlobals.isNavigating) {
        console.log(
          "Navigation already in progress, skipping duplicate navigate"
        )
        return
      }

      // Set navigation flag
      if (typeof window !== "undefined") {
        authGlobals.isNavigating = true
        authGlobals.lastNavigationTimestamp = Date.now()

        // Clear the flag after a timeout in case something goes wrong
        setTimeout(() => {
          authGlobals.isNavigating = false
        }, 2000)
      }

      // Use router for navigation
      router.push(path)
    },
    [router]
  )

  // Effect to handle cookie changes or browser data clearing
  useEffect(() => {
    const hasCookies = checkCookies()

    // If session exists in memory but cookies are gone, force refresh
    if (session?.user && !hasCookies) {
      console.log("Cookies missing but session exists - forcing refresh")
      refetch()
    }

    // Set up event listener for storage changes
    const handleStorageChange = () => {
      refetch()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [session, refetch, checkCookies])

  // Set up session refresh interval
  useEffect(() => {
    let isRefreshing = false
    let lastRefreshAttemptTime = 0

    const refreshIntervalHandler = async () => {
      // Skip if already refreshing or not authenticated
      if (isRefreshing || status !== "authenticated") return

      // Check if cookies still exist
      const hasCookies = checkCookies()

      if (!hasCookies && status === "authenticated") {
        console.log(
          "Auth cookies missing but status is authenticated - refreshing"
        )
        refetch()
        return
      }

      // Skip if we attempted a refresh recently
      if (Date.now() - lastRefreshAttemptTime < 120000) {
        return
      }

      try {
        isRefreshing = true
        lastRefreshAttemptTime = Date.now()
        await refetch()

        // Update global timestamp
        if (typeof window !== "undefined") {
          authGlobals.lastSessionRefreshTimestamp = Date.now()
        }
      } catch (error) {
        console.error("Scheduled session refresh failed:", error)
      } finally {
        isRefreshing = false
      }
    }

    // Refresh session every 30 minutes
    const refreshInterval = setInterval(refreshIntervalHandler, 30 * 60 * 1000)

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        status === "authenticated" &&
        Date.now() - (authGlobals.lastSessionRefreshTimestamp || 0) >
          5 * 60 * 1000
      ) {
        refreshIntervalHandler()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(refreshInterval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [status, refetch, checkCookies])

  // Enhanced login mutation with navigation handling and better error handling
  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => {
      // Show loading toast for better UX
      const loadingToast = toast({
        title: "Signing in...",
        description: "Verifying your credentials",
      })

      try {
        // First check if API is available with a single retry
        let apiAvailable = false

        // Try the API connection check
        console.log("Checking API availability...")
        apiAvailable = await authClient.testApiConnection()

        if (!apiAvailable) {
          // One retry with a short delay
          console.log(
            "API not available on first attempt, retrying in 1000ms..."
          )
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Try again
          console.log("Retrying API availability check...")
          apiAvailable = await authClient.testApiConnection()
        }

        // If still not available, try the Next.js API proxy as a last resort
        if (!apiAvailable) {
          console.log(
            "Trying API health check via Next.js API proxy as last resort"
          )
          try {
            const response = await fetch("/api/health-check", {
              method: "GET",
              cache: "no-store",
            })

            if (response.ok) {
              const data = await response.json()
              if (data.apiServer === "healthy") {
                console.log("API server is healthy via proxy route")
                apiAvailable = true
              }
            }
          } catch (error) {
            console.warn(
              "Proxy health check failed:",
              error instanceof Error ? error.message : "Unknown error"
            )
          }
        }

        if (!apiAvailable) {
          console.error("API server is not available after attempts")
          throw new Error(
            "API server is not available. Please check your connection and try again."
          )
        }

        console.log("API is available, proceeding with login...")
        return await authClient.login(email, password)
      } catch (error) {
        console.error("Login error:", error)

        // Enhance error with more context if it's a network error
        if (error instanceof Error) {
          // Check for specific error types
          if (error.name === "AbortError") {
            throw new Error("API Server Connection Error: Request timed out")
          }

          if (
            error.message.includes("fetch") ||
            error.message.includes("network") ||
            error.message.includes("API server") ||
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("timeout") ||
            error.message.includes("ECONNREFUSED")
          ) {
            throw new Error(`API Server Connection Error: ${error.message}`)
          }
        }

        throw error
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
      if (typeof window !== "undefined") {
        window.__lastSessionRefresh = Date.now()
        authGlobals.lastSessionRefreshTimestamp = Date.now()

        // Force an immediate router refresh to update UI based on auth state
        // This is critical to ensure all components re-render with the new auth state
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
      }
    },
    onError: (error: any) => {
      // Check if the error is related to API server connection issues
      const isApiServerError =
        error.message?.includes("API server is not available") ||
        error.message?.includes("API Server Connection Error") ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("Network Error") ||
        error.message?.includes("timeout") ||
        error.message?.includes("ECONNREFUSED") ||
        error.response?.status === 503 ||
        error.response?.status === 504 ||
        error.response?.data?.apiStatus === "offline"

      // Create a user-friendly error message
      let errorMessage = ""
      let errorTitle = ""

      if (isApiServerError) {
        errorTitle = "Server Connection Error"

        // Provide specific messages for different connection issues
        if (error.message?.includes("timeout") || error.name === "AbortError") {
          errorMessage =
            "The server took too long to respond. Please try again later."
        } else if (
          error.message?.includes("ECONNREFUSED") ||
          error.message?.includes("not available")
        ) {
          errorMessage =
            "Cannot connect to the authentication server. Please ensure the API server is running."
        } else if (
          error.response?.status === 503 ||
          error.response?.status === 504
        ) {
          errorMessage =
            "The authentication server is temporarily unavailable. Please try again later."
        } else {
          errorMessage =
            "There was a problem connecting to the authentication server. Please check your network connection and try again."
        }
      } else {
        errorTitle = "Login failed"
        errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Invalid email or password. Please try again."

        // Clean up error messages
        if (errorMessage.includes("Login failed:")) {
          errorMessage = errorMessage.replace("Login failed:", "").trim()
        }
      }

      // Show error toast
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })

      // For sonner toast compatibility
      sonnerToast.error(errorMessage)

      // If it's an API server error, provide more detailed console logging to help diagnosis
      if (isApiServerError) {
        console.error("API Server Connection Error:", {
          message: error.message,
          name: error.name,
          status: error.response?.status,
          data: error.response?.data,
          code: error.code,
          stack: error.stack,
        })

        // Suggest solutions in console
        console.info("Possible solutions:")
        console.info("1. Check if the API server is running")
        console.info("2. Verify the API URL in .env.local is correct")
        console.info("3. Check for network connectivity issues")
        console.info("4. Ensure ports are not blocked by firewall")
      }
    },
  })

  // Enhanced logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Don't set status to loading immediately to prevent UI flicker
      if (typeof window !== "undefined" && !authGlobals.isNavigating) {
        // Mark that we're handling navigation
        authGlobals.isNavigating = true
        authGlobals.lastNavigationTimestamp = Date.now()
      }

      return await authClient.logout()
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    },
    onSettled: () => {
      // Always release the navigation lock after a timeout
      if (typeof window !== "undefined") {
        setTimeout(() => {
          authGlobals.isNavigating = false
        }, 2000)
      }
    },
  })

  // Register mutation with enhanced UX
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
      // Show loading toast for better UX
      const loadingToast = toast({
        title: "Creating account...",
        description: "Setting up your account",
      })

      try {
        return await authClient.register(email, password, name)
      } finally {
        // Clear loading toast
        loadingToast.dismiss?.()
      }
    },
    onSuccess: (newSession) => {
      // Update query cache
      queryClient.setQueryData(SESSION_QUERY_KEY, newSession)

      // Show success toast
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      })

      // For sonner toast compatibility
      sonnerToast.success("Account created successfully")

      // Set global auth state
      if (typeof window !== "undefined") {
        window.__lastSessionRefresh = Date.now()
        authGlobals.lastSessionRefreshTimestamp = Date.now()
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.message || "Please try again with different credentials."

      // Show error toast
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      })

      // For sonner toast compatibility
      sonnerToast.error(errorMessage)
    },
  })

  // Enhanced session refresh - combines both implementations
  const refreshSession = useCallback(
    async (force = false) => {
      try {
        // Don't refresh if we're already in a client-side navigation
        if (
          typeof window !== "undefined" &&
          authGlobals.isNavigating &&
          !force
        ) {
          console.log("Skipping session refresh during navigation")
          return
        }

        // Check if we refreshed recently and not forcing
        const now = Date.now()
        if (
          !force &&
          typeof window !== "undefined" &&
          now - (authGlobals.lastSessionRefreshTimestamp || 0) < 30000
        ) {
          console.log("Skipping session refresh - last refresh too recent")
          return
        }

        // Perform the refresh using React Query's refetch
        await refetch()

        // Update timestamp
        if (typeof window !== "undefined") {
          authGlobals.lastSessionRefreshTimestamp = Date.now()
        }
      } catch (error) {
        console.error("Failed to refresh session:", error)
      }
    },
    [refetch]
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

  // Return a unified API that includes both useSession and useAuth functionality
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
    loginSync: loginMutation.mutate, // For components using the sync version
    isLoggingIn: loginMutation.isPending,

    logout: logoutMutation.mutateAsync,
    logoutSync: logoutMutation.mutate, // For components using the sync version
    isLoggingOut: logoutMutation.isPending,

    register: registerMutation.mutateAsync,
    registerSync: registerMutation.mutate, // For components using the sync version
    isRegistering: registerMutation.isPending,

    refreshSession,

    // Navigation helper
    navigate,

    // For legacy compatibility
    data: session,
  }
}

// Export a default instance for easy imports
export default useAuthSession
