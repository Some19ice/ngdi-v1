"use client"

import { ReactNode, useState, useEffect } from "react"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ApiDataWrapperProps<T> {
  children: (data: T) => ReactNode
  fetchData: () => Promise<T>
  loadingComponent?: ReactNode
  errorComponent?: (error: Error, retry: () => void) => ReactNode
  dependencies?: any[]
}

/**
 * A wrapper component for API data fetching with loading and error states
 * @template T The type of data being fetched
 */
export function ApiDataWrapper<T>({
  children,
  fetchData,
  loadingComponent,
  errorComponent,
  dependencies = [],
}: ApiDataWrapperProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchData()
      setData(result)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch data"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  // Default loading component
  const defaultLoadingComponent = (
    <div className="flex justify-center items-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  )

  // Default error component
  const defaultErrorComponent = (error: Error, retry: () => void) => (
    <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 min-h-[200px]">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Failed to load data</h3>
      <p className="text-sm text-red-600 dark:text-red-300 mb-4 text-center max-w-md">
        {error.message || "An error occurred while fetching data"}
      </p>
      <Button 
        variant="outline" 
        className="border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
        onClick={retry}
      >
        Try Again
      </Button>
    </div>
  )

  // Show loading state
  if (loading) {
    return <>{loadingComponent || defaultLoadingComponent}</>
  }

  // Show error state
  if (error) {
    return <>{errorComponent ? errorComponent(error, loadData) : defaultErrorComponent(error, loadData)}</>
  }

  // Show data if available
  if (data) {
    return (
      <ErrorBoundary>
        {children(data)}
      </ErrorBoundary>
    )
  }

  // Fallback for unexpected state
  return defaultErrorComponent(new Error("No data available"), loadData)
}

export default ApiDataWrapper
