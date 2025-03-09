"use client"

import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface SuspenseSearchParamsProps {
  children: React.ReactNode
}

export function SuspenseSearchParams({ children }: SuspenseSearchParamsProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="ml-2 text-muted-foreground">Loading...</p>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
