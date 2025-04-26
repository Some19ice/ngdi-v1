"use client"

import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, useEffect } from "react"
import { ProtectedRoutePrefetcher } from "@/components/protected-route-prefetcher"
import { OnboardingProvider } from "@/components/providers/onboarding-provider"
import { setupAxiosTokenRefresh, setupTokenRefreshTimer } from "@/lib/auth-refresh"
import axios from "axios"
import dynamic from "next/dynamic"

// Import the debug component dynamically to avoid SSR issues
const ApiStatusDebug = dynamic(
  () =>
    import("@/components/debug/api-status").then((mod) => mod.ApiStatusDebug),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  // Set up token refresh on client-side only
  useEffect(() => {
    // Setup axios interceptor for token refresh
    setupAxiosTokenRefresh(axios)

    // Setup timer to refresh token before expiration
    setupTokenRefreshTimer()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <OnboardingProvider>
            <ProtectedRoutePrefetcher />
            {children}
            {process.env.NODE_ENV === "development" && <ApiStatusDebug />}
          </OnboardingProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </AuthProvider>
    </QueryClientProvider>
  )
} 