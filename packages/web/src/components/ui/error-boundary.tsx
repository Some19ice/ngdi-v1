"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary component to catch and handle errors in React components
 * This prevents the entire application from crashing when an error occurs in a component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    
    // Update state with error info
    this.setState({
      errorInfo,
    })
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 m-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4 text-center">
            An error occurred while rendering this component.
          </p>
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <div className="mb-4 w-full overflow-auto max-h-40 p-3 bg-red-100 dark:bg-red-900/30 rounded text-xs font-mono">
              <p className="font-semibold">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <pre className="mt-2 text-red-700 dark:text-red-300">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
          <Button 
            variant="outline" 
            className="border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
            onClick={this.resetError}
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component to wrap a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component"
  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`
  
  return WithErrorBoundary
}
