import React from "react"
import { memoWithDeepCompare } from "./memo-utils"

/**
 * Higher-order component that memoizes a component with optional custom comparison
 * 
 * @param Component The component to memoize
 * @param propsAreEqual Optional custom comparison function
 * @returns Memoized component
 */
export function withMemo<T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
): T {
  // Use the memoWithDeepCompare utility with the provided comparison function
  const MemoizedComponent = memoWithDeepCompare(Component, propsAreEqual)
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || "Component"
  MemoizedComponent.displayName = `Memo(${displayName})`
  
  return MemoizedComponent
}

/**
 * Higher-order component that memoizes a component and adds performance monitoring
 * This is useful for debugging and identifying components that re-render too often
 * 
 * @param Component The component to memoize
 * @param propsAreEqual Optional custom comparison function
 * @returns Memoized component with performance monitoring
 */
export function withMemoDebug<T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
): T {
  // Create a wrapper component that logs renders
  const DebugComponent = (props: React.ComponentProps<T>) => {
    const displayName = Component.displayName || Component.name || "Component"
    
    // Log render in development mode
    if (process.env.NODE_ENV === "development") {
      console.log(`[Render] ${displayName}`, props)
    }
    
    return <Component {...props} />
  }
  
  // Set display name for debugging
  DebugComponent.displayName = `Debug(${Component.displayName || Component.name || "Component"})`
  
  // Memoize the debug component
  return withMemo(DebugComponent as unknown as T, propsAreEqual)
}

export default withMemo
