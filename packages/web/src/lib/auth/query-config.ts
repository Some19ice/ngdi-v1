/**
 * React Query configuration for authentication
 * This file provides optimized query configurations for auth-related queries
 */

import { QueryClient } from "@tanstack/react-query"
import { AuthSession, AuthUser } from "./auth-types"

/**
 * Query keys for authentication
 */
export const AUTH_QUERY_KEYS = {
  /**
   * Session query key
   */
  session: ["auth", "session"] as const,
  
  /**
   * User query key
   */
  user: ["auth", "user"] as const,
  
  /**
   * User profile query key
   * @param userId User ID
   */
  userProfile: (userId: string) => ["auth", "user", userId, "profile"] as const,
  
  /**
   * User permissions query key
   * @param userId User ID
   */
  userPermissions: (userId: string) => ["auth", "user", userId, "permissions"] as const,
}

/**
 * Default stale time for auth queries (5 minutes)
 */
export const DEFAULT_STALE_TIME = 5 * 60 * 1000

/**
 * Default cache time for auth queries (10 minutes)
 */
export const DEFAULT_CACHE_TIME = 10 * 60 * 1000

/**
 * Default refetch interval for auth queries (10 minutes)
 */
export const DEFAULT_REFETCH_INTERVAL = 10 * 60 * 1000

/**
 * Default refetch on window focus for auth queries
 */
export const DEFAULT_REFETCH_ON_WINDOW_FOCUS = true

/**
 * Default refetch on reconnect for auth queries
 */
export const DEFAULT_REFETCH_ON_RECONNECT = true

/**
 * Default retry count for auth queries
 */
export const DEFAULT_RETRY_COUNT = 1

/**
 * Configure the query client for authentication
 * @param queryClient The query client to configure
 */
export function configureAuthQueries(queryClient: QueryClient): void {
  // Set default query options for auth queries
  queryClient.setQueryDefaults(AUTH_QUERY_KEYS.session, {
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    refetchInterval: DEFAULT_REFETCH_INTERVAL,
    refetchOnWindowFocus: DEFAULT_REFETCH_ON_WINDOW_FOCUS,
    refetchOnReconnect: DEFAULT_REFETCH_ON_RECONNECT,
    retry: DEFAULT_RETRY_COUNT,
  })
  
  queryClient.setQueryDefaults(AUTH_QUERY_KEYS.user, {
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    refetchOnWindowFocus: DEFAULT_REFETCH_ON_WINDOW_FOCUS,
    refetchOnReconnect: DEFAULT_REFETCH_ON_RECONNECT,
    retry: DEFAULT_RETRY_COUNT,
  })
}

/**
 * Set the session data in the query cache
 * @param queryClient The query client
 * @param session The session data
 */
export function setSessionData(queryClient: QueryClient, session: AuthSession | null): void {
  queryClient.setQueryData(AUTH_QUERY_KEYS.session, session)
  
  if (session?.user) {
    queryClient.setQueryData(AUTH_QUERY_KEYS.user, session.user)
  } else {
    queryClient.setQueryData(AUTH_QUERY_KEYS.user, null)
  }
}

/**
 * Get the session data from the query cache
 * @param queryClient The query client
 * @returns The session data or null if not found
 */
export function getSessionData(queryClient: QueryClient): AuthSession | null | undefined {
  return queryClient.getQueryData<AuthSession | null>(AUTH_QUERY_KEYS.session)
}

/**
 * Get the user data from the query cache
 * @param queryClient The query client
 * @returns The user data or null if not found
 */
export function getUserData(queryClient: QueryClient): AuthUser | null | undefined {
  return queryClient.getQueryData<AuthUser | null>(AUTH_QUERY_KEYS.user)
}

/**
 * Invalidate all auth queries
 * @param queryClient The query client
 */
export function invalidateAuthQueries(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: ["auth"] })
}

/**
 * Reset all auth queries
 * @param queryClient The query client
 */
export function resetAuthQueries(queryClient: QueryClient): void {
  queryClient.resetQueries({ queryKey: ["auth"] })
}
