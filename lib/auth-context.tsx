"use client";

import React, { createContext, useContext, useCallback } from "react"
import { Session, User, authClient } from "./auth-client"
import { UserRole } from "./auth/constants"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  useQuery,
  useMutation,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query"

// Session query key
const SESSION_QUERY_KEY = ["session"]

/**
 * @deprecated This interface is maintained for backward compatibility.
 * Please use useAuthSession from @/hooks/use-auth-session for new code.
 */
interface AuthContextType {
  session: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
  login: (email: string, password: string) => Promise<Session | void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  user?: User | null
  isAuthenticated?: boolean
  hasRole?: (role: UserRole | UserRole[]) => boolean
  isAdmin?: boolean
  isNodeOfficer?: boolean
  navigate?: (path: string) => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "loading",
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
})

/**
 * @deprecated This provider is maintained for backward compatibility.
 * Please use useAuthSession from @/hooks/use-auth-session for new code.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query for session data
  const {
    data: session,
    isLoading,
    refetch,
  } = useQuery<Session | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => authClient.getSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })

  // Convert React Query status to auth context status
  const status: "loading" | "authenticated" | "unauthenticated" = isLoading
    ? "loading"
    : session
      ? "authenticated"
      : "unauthenticated"

  // User and role helpers
  const user = session?.user || null
  const userRole = user?.role?.toUpperCase() as UserRole | undefined

  // Role checking function
  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!userRole) return false

      if (Array.isArray(roles)) {
        return roles.includes(userRole)
      }

      return roles === userRole
    },
    [userRole]
  )

  // Role convenience properties
  const isAdmin = userRole === UserRole.ADMIN
  const isNodeOfficer = userRole === UserRole.NODE_OFFICER || isAdmin
  const isAuthenticated = status === "authenticated"

  // Navigation helper
  const navigate = useCallback(
    (path: string) => {
      router.push(path)
    },
    [router]
  )

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authClient.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, data)
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: {
      email: string
      password: string
      name?: string
    }) => authClient.register(userData.email, userData.password, userData.name),
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authClient.logout(),
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

  return (
    <AuthContext.Provider
      value={{
        session: session || null,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * @deprecated Please use useAuthSession from @/hooks/use-auth-session instead.
 * This hook is maintained for backward compatibility.
 * 
 * MIGRATION NOTICE:
 * This hook will be removed in a future version.
 * Please update your imports to use useAuthSession from @/hooks/use-auth-session.
 */
export function useAuth() {
  console.warn(
    "useAuth in auth-context.tsx is deprecated and will be removed in a future version. " +
    "Please use useAuthSession from @/hooks/use-auth-session instead."
  )
  return useContext(AuthContext);
}

/**
 * @deprecated Please use useAuthSession from @/hooks/use-auth-session instead.
 * This hook is maintained for backward compatibility.
 * 
 * MIGRATION NOTICE:
 * This hook will be removed in a future version.
 * Please update your imports to use useAuthSession from @/hooks/use-auth-session.
 */
export function useSession() {
  console.warn(
    "useSession in auth-context.tsx is deprecated and will be removed in a future version. " +
    "Please use useAuthSession from @/hooks/use-auth-session instead."
  )
  const { session, status } = useAuth();
  return { data: session, status };
}

/**
 * @deprecated Please use useAuthSession from @/hooks/use-auth-session instead.
 * This hook is maintained for backward compatibility.
 * 
 * MIGRATION NOTICE:
 * This hook will be removed in a future version.
 * Please update your imports to use useAuthSession from @/hooks/use-auth-session.
 */
export function useUser(): { user: User | null; isLoading: boolean } {
  console.warn(
    "useUser is deprecated and will be removed in a future version. " +
    "Please use useAuthSession from @/hooks/use-auth-session instead."
  )
  const { session, status } = useAuth();
  return {
    user: session?.user || null,
    isLoading: status === "loading",
  };
}

/**
 * @deprecated Please use useAuthSession from @/hooks/use-auth-session instead.
 * This hook is maintained for backward compatibility.
 * 
 * MIGRATION NOTICE:
 * This hook will be removed in a future version.
 * Please update your imports to use useAuthSession from @/hooks/use-auth-session.
 */
export function useIsAuthenticated(): boolean {
  console.warn(
    "useIsAuthenticated is deprecated and will be removed in a future version. " +
    "Please use useAuthSession from @/hooks/use-auth-session instead."
  )
  const { status } = useAuth();
  return status === "authenticated";
}

/**
 * @deprecated Please use useAuthSession from @/hooks/use-auth-session instead.
 * This hook is maintained for backward compatibility.
 * 
 * MIGRATION NOTICE:
 * This hook will be removed in a future version.
 * Please update your imports to use useAuthSession from @/hooks/use-auth-session.
 */
export function useIsAdmin(): boolean {
  console.warn(
    "useIsAdmin is deprecated and will be removed in a future version. " +
    "Please use useAuthSession from @/hooks/use-auth-session instead."
  )
  const { session } = useAuth();
  const role = session?.user?.role
  return role?.toUpperCase() === "ADMIN"
}

/**
 * @deprecated Please use useAuthSession from @/hooks/use-auth-session instead.
 * This hook is maintained for backward compatibility.
 * 
 * MIGRATION NOTICE:
 * This hook will be removed in a future version.
 * Please update your imports to use useAuthSession from @/hooks/use-auth-session.
 */
export function useIsNodeOfficer(): boolean {
  console.warn(
    "useIsNodeOfficer is deprecated and will be removed in a future version. " +
    "Please use useAuthSession from @/hooks/use-auth-session instead."
  )
  const { session } = useAuth();
  const role = session?.user?.role;
  return (
    role?.toUpperCase() === "NODE_OFFICER" || role?.toUpperCase() === "ADMIN"
  )
} 