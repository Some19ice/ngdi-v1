"use client"

import { ReactNode, Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AuthPageWrapperProps {
  children: ReactNode
}

/**
 * Wrapper component for auth pages that:
 * 1. Wraps content in a Suspense boundary for useSearchParams
 * 2. Provides consistent loading UI
 * 3. Ensures client-side rendering for auth components
 */
export function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="ml-2 text-muted-foreground">
            Loading authentication...
          </p>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
