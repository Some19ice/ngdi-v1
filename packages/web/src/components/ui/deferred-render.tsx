"use client"

import React, { useState, useEffect } from "react"

interface DeferredRenderProps {
  children: React.ReactNode
  delay?: number
  fallback?: React.ReactNode
  priority?: "idle" | "low" | "normal" | "high" | "user-visible"
}

/**
 * A component that defers rendering of its children until after the main content has loaded
 * This improves initial load performance by prioritizing critical UI elements
 */
export function DeferredRender({
  children,
  delay = 0,
  fallback = null,
  priority = "idle",
}: DeferredRenderProps) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Use requestIdleCallback for idle priority if available
    if (priority === "idle" && "requestIdleCallback" in window) {
      const handle = requestIdleCallback(
        () => {
          setTimeout(() => setShouldRender(true), delay)
        },
        { timeout: 1000 }
      )
      return () => cancelIdleCallback(handle)
    }

    // Use requestAnimationFrame for high priority
    if (priority === "high" || priority === "user-visible") {
      const handle = requestAnimationFrame(() => {
        setTimeout(() => setShouldRender(true), delay)
      })
      return () => cancelAnimationFrame(handle)
    }

    // Use setTimeout for normal and low priority
    const timeout = setTimeout(() => {
      setShouldRender(true)
    }, delay + (priority === "low" ? 100 : 0))

    return () => clearTimeout(timeout)
  }, [delay, priority])

  return shouldRender ? <>{children}</> : <>{fallback}</>
}

export default DeferredRender
