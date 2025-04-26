"use client"

import { ReactNode, Suspense } from "react"

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Wrapper component for client-side only components that need to be wrapped in Suspense
 * Particularly useful for components using useSearchParams() and other client-side hooks
 */
export function ClientOnly({
  children,
  fallback = <div>Loading...</div>,
}: ClientOnlyProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}
