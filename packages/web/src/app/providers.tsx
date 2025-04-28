"use client"

import { AuthProvider } from "@/lib/supabase-auth-context"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, useEffect } from "react"
import { ProtectedRoutePrefetcher } from "@/components/protected-route-prefetcher"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Toaster } from "sonner"

// Supabase Auth handles token refresh automatically
import axios from "axios"
import dynamic from "next/dynamic"

// Import the debug component dynamically to avoid SSR issues
const ApiStatusDebug = dynamic(
  () =>
    import("@/components/debug/api-status").then((mod) => mod.ApiStatusDebug),
  { ssr: false }
)

// Global error fallback component
const GlobalErrorFallback = (
  <div className="flex min-h-screen flex-col items-center justify-center p-4">
    <div className="rounded-lg border bg-card p-8 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
      <p className="mb-6 text-muted-foreground">
        The application encountered an unexpected error. Please refresh the page
        to try again.
      </p>
      <button
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  </div>
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

  // Supabase Auth handles token refresh automatically
  useEffect(() => {
    // Configure axios defaults
    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL
    axios.defaults.withCredentials = true
  }, [])

  return (
    <ErrorBoundary fallback={GlobalErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ProtectedRoutePrefetcher />
            {children}
            {process.env.NODE_ENV === "development" && <ApiStatusDebug />}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
