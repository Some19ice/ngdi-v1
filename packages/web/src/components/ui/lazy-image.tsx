"use client"

import React, { useState, useEffect } from "react"
import Image, { ImageProps } from "next/image"
import { useInView } from "@/lib/optimization/memo-utils"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallback?: React.ReactNode
  showLoadingIndicator?: boolean
  loadingIndicator?: React.ReactNode
  threshold?: number
  rootMargin?: string
}

/**
 * A lazy loading image component that only loads when it's in the viewport
 * This improves performance by reducing initial load time and bandwidth usage
 */
export function LazyImage({
  src,
  alt,
  className,
  fallback,
  showLoadingIndicator = true,
  loadingIndicator,
  threshold = 0.1,
  rootMargin = "200px 0px",
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { ref, isInView } = useInView({
    threshold,
    rootMargin,
  })

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
  }, [src])

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
  }

  // Handle image error
  const handleError = () => {
    setHasError(true)
  }

  // Default loading indicator
  const defaultLoadingIndicator = (
    <Skeleton className="w-full h-full absolute inset-0" />
  )

  // Default fallback for error
  const defaultFallback = (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    </div>
  )

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{ ...props.style }}
    >
      {/* Show loading indicator until image is loaded */}
      {showLoadingIndicator && !isLoaded && !hasError && (
        <div className="absolute inset-0">
          {loadingIndicator || defaultLoadingIndicator}
        </div>
      )}

      {/* Show fallback if there's an error */}
      {hasError && <div className="absolute inset-0">{fallback || defaultFallback}</div>}

      {/* Only render the image when it's in view */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  )
}

export default LazyImage
