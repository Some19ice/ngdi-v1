"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthLoadingProps {
  /**
   * The loading state message
   */
  message?: string
  /**
   * The loading state description
   */
  description?: string
  /**
   * The size of the loading spinner
   */
  size?: "sm" | "md" | "lg"
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * A loading component for authentication operations
 */
export function AuthLoading({
  message = "Authenticating",
  description = "Please wait while we verify your credentials...",
  size = "md",
  className,
}: AuthLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div
      className={cn(
        "flex min-h-[200px] w-full flex-col items-center justify-center space-y-4 text-center",
        className
      )}
    >
      <div className="relative">
        <Loader2
          className={cn("animate-spin text-primary", sizeClasses[size])}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-background" />
        </div>
      </div>
      {message && (
        <h3 className="text-lg font-semibold tracking-tight">{message}</h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

/**
 * A loading button component for authentication operations
 */
export function AuthLoadingButton({
  isLoading,
  loadingText = "Please wait...",
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading: boolean
  loadingText?: string
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
