/**
 * @deprecated Please use useAuthSession from @/hooks/use-auth-session instead.
 * This hook is maintained for backward compatibility.
 * 
 * MIGRATION NOTICE:
 * This hook will be removed in a future version.
 * Please update your imports to use useAuthSession from @/hooks/use-auth-session.
 */

import { useAuthSession } from "./use-auth-session"

/**
 * Hook for session management using React Query
 * @deprecated Use useAuthSession instead for new code
 */
export function useSession() {
  console.warn(
    "useSession is deprecated and will be removed in a future version. " +
    "Please use useAuthSession from @/hooks/use-auth-session instead."
  )
  
  const auth = useAuthSession()

  // Return the same API shape for backward compatibility
  return {
    data: auth.session, // This matches next-auth's useSession return shape
    status: auth.status,
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
