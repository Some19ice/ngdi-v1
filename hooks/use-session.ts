import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authClient, Session, User } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { UserRole } from "@/lib/auth/constants"
import React from "react"

// Query keys
const SESSION_QUERY_KEY = ["session"]

/**
 * Hook for session management using React Query
 */
export function useSession() {
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
    queryFn: () => authClient.getSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    refetchOnMount: true,
  })

  // Check for cookie existence - this helps detect when browser data is cleared
  const checkCookies = () => {
    if (typeof document === "undefined") return true
    const hasAuthCookie = document.cookie.includes("auth_token")
    const hasRefreshCookie = document.cookie.includes("refresh_token")
    return hasAuthCookie || hasRefreshCookie
  }

  // Effect to handle cookie changes or browser data clearing
  React.useEffect(() => {
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
  }, [session, refetch])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authClient.login(email, password),
    onSuccess: (newSession) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, newSession)
      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description:
          error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null)
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
      router.push("/login")
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: ({
      email,
      password,
      name,
    }: {
      email: string
      password: string
      name?: string
    }) => authClient.register(email, password, name),
    onSuccess: (newSession) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, newSession)
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description:
          error.message || "Please try again with different credentials.",
        variant: "destructive",
      })
    },
  })

  // Helper functions
  const isAuthenticated = !!session?.user
  const user = session?.user || null

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false

    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }

  const isAdmin = user?.role === UserRole.ADMIN
  const isNodeOfficer = user?.role === UserRole.NODE_OFFICER || isAdmin

  return {
    session,
    user,
    isLoading,
    isError,
    error,
    isAuthenticated,
    hasRole,
    isAdmin,
    isNodeOfficer,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    refreshSession: refetch,
  }
}
