"use client"

import { useEffect, useRef } from "react"
import { performanceMonitor } from "@/lib/optimization/performance-monitor"

/**
 * Hook for monitoring component performance
 * This helps identify components that are causing performance issues
 * 
 * @param componentName Name of the component
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0)
  
  useEffect(() => {
    // Skip in production
    if (process.env.NODE_ENV !== "development") return
    
    // Skip on server
    if (typeof window === "undefined") return
    
    // Increment render count
    renderCountRef.current++
    
    // Start measuring
    const endMeasure = performanceMonitor.startMeasure(
      `${componentName} (${renderCountRef.current})`
    )
    
    // End measuring after render
    const timeout = setTimeout(endMeasure, 0)
    
    return () => {
      clearTimeout(timeout)
    }
  })
}

/**
 * Higher-order component that adds performance monitoring to a component
 * 
 * @param Component The component to monitor
 * @returns Monitored component
 */
export function withPerformanceMonitor<T extends React.ComponentType<any>>(
  Component: T
): T {
  // Create a wrapper component that monitors performance
  const MonitoredComponent = (props: React.ComponentProps<T>) => {
    const displayName = Component.displayName || Component.name || "Component"
    usePerformanceMonitor(displayName)
    
    return <Component {...props} />
  }
  
  // Set display name for debugging
  MonitoredComponent.displayName = `Monitored(${Component.displayName || Component.name || "Component"})`
  
  return MonitoredComponent as unknown as T
}

export default usePerformanceMonitor
