/**
 * @deprecated Please use useAuthSession from @/hooks/use-auth-session instead.
 * This hook is maintained for backward compatibility.
 */

import { useAuthSession } from "./use-auth-session"

/**
 * Hook for session management using React Query
 * @deprecated Use useAuthSession instead for new code
 */
export function useSession() {
  const auth = useAuthSession()

  // Return the same API shape for backward compatibility
  return {
    session: auth.session,
    user: auth.user,
    isLoading: auth.isLoading,
    isError: auth.isError,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    hasRole: auth.hasRole,
    isAdmin: auth.isAdmin,
    isNodeOfficer: auth.isNodeOfficer,
    login: auth.loginSync,
    isLoggingIn: auth.isLoggingIn,
    logout: auth.logoutSync,
    isLoggingOut: auth.isLoggingOut,
    register: auth.registerSync,
    isRegistering: auth.isRegistering,
    refreshSession: auth.refreshSession,
  }
}
