import { memo, useCallback, useMemo, useRef, useState, useEffect } from "react"
import { isEqual } from "lodash-es"

/**
 * Enhanced memo HOC with deep comparison
 * Use this for components that receive complex props that might change references
 * but not actual values
 */
export function memoWithDeepCompare<T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual = isEqual
): T {
  return memo(Component, propsAreEqual) as T
}

/**
 * Hook to memoize a value with deep comparison
 * Use this when you need to memoize a complex object that might change references
 * but not actual values
 */
export function useDeepMemo<T>(value: T, deps: React.DependencyList): T {
  const ref = useRef<{ value: T; deps: React.DependencyList }>({
    value,
    deps,
  })

  if (!isEqual(deps, ref.current.deps)) {
    ref.current = { value, deps }
  }

  return ref.current.value
}

/**
 * Hook to memoize a callback with deep comparison of dependencies
 * Use this when you need to memoize a callback that depends on complex objects
 */
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ callback: T; deps: React.DependencyList }>({
    callback,
    deps,
  })

  if (!isEqual(deps, ref.current.deps)) {
    ref.current = { callback, deps }
  }

  return useCallback((...args: any[]) => {
    return ref.current.callback(...args)
  }, []) as T
}

/**
 * Hook to track if a component is mounted
 * Use this to prevent state updates on unmounted components
 */
export function useIsMounted() {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return useCallback(() => isMounted.current, [])
}

/**
 * Hook to debounce a value
 * Use this to prevent excessive re-renders when a value changes rapidly
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook to throttle a callback
 * Use this to limit how often a function can be called
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0)
  const lastArgs = useRef<any[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      lastArgs.current = args

      if (now - lastCall.current >= delay) {
        lastCall.current = now
        return callback(...args)
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now()
          timeoutRef.current = null
          callback(...lastArgs.current)
        }, delay - (now - lastCall.current))
      }
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}

/**
 * Hook to detect when a component is visible in the viewport
 * Use this for lazy loading or triggering animations
 */
export function useInView(options?: IntersectionObserverInit) {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    }, options)

    observer.observe(ref)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return { ref: setRef, isInView }
}
