"use client"

import { ReactNode } from "react"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

interface PageErrorBoundaryProps {
  children: ReactNode
  title?: string
  description?: string
  showHomeButton?: boolean
  showBackButton?: boolean
}

/**
 * A specialized error boundary for page-level components
 * Provides a consistent error UI for pages with navigation options
 */
export function PageErrorBoundary({
  children,
  title = "Something went wrong",
  description = "We encountered an error while loading this page",
  showHomeButton = true,
  showBackButton = true,
}: PageErrorBoundaryProps) {
  const router = useRouter()

  const errorFallback = (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        {description}
      </p>
      <div className="flex gap-4">
        {showBackButton && (
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        )}
        {showHomeButton && (
          <Button onClick={() => router.push("/")}>
            Return to Home
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <ErrorBoundary fallback={errorFallback}>
      {children}
    </ErrorBoundary>
  )
}

export default PageErrorBoundary
