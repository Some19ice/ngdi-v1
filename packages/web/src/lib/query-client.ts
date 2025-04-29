import { QueryClient } from "@tanstack/react-query"
import { configureAuthQueries } from "./auth/query-config"

/**
 * Create a new React Query client with optimized settings
 * @returns A configured React Query client
 */
export function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 1,
      },
    },
  })

  // Configure auth queries with optimized settings
  configureAuthQueries(queryClient)

  return queryClient
}

/**
 * Default React Query client instance
 * Use this for most cases
 */
export const queryClient = createQueryClient()
