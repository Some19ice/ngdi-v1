"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import { useThrottle } from "@/lib/optimization/memo-utils"
import { cn } from "@/lib/utils"

interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  className?: string
  overscan?: number
  onEndReached?: () => void
  endReachedThreshold?: number
  scrollToIndex?: number
}

/**
 * A virtualized list component that only renders items that are visible in the viewport
 * This significantly improves performance for long lists
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  className,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 0.8,
  scrollToIndex,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [hasCalledEndReached, setHasCalledEndReached] = useState(false)

  // Calculate the total height of all items
  const totalHeight = items.length * itemHeight

  // Calculate the range of visible items
  const visibleRange = useMemo(() => {
    if (containerHeight === 0) return { start: 0, end: 10 }

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { start: startIndex, end: endIndex }
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan])

  // Handle scroll events
  const handleScroll = useThrottle(() => {
    if (!containerRef.current) return
    setScrollTop(containerRef.current.scrollTop)

    // Check if we've reached the end of the list
    if (onEndReached && !hasCalledEndReached) {
      const scrollPosition = containerRef.current.scrollTop + containerRef.current.clientHeight
      const scrollThreshold = totalHeight * endReachedThreshold

      if (scrollPosition >= scrollThreshold) {
        setHasCalledEndReached(true)
        onEndReached()
      }
    }
  }, 16) // ~60fps

  // Reset the end reached flag when items change
  useEffect(() => {
    setHasCalledEndReached(false)
  }, [items])

  // Measure the container height on mount and resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          setContainerHeight(entry.contentRect.height)
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    setContainerHeight(containerRef.current.clientHeight)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Scroll to a specific index if requested
  useEffect(() => {
    if (scrollToIndex !== undefined && containerRef.current) {
      containerRef.current.scrollTop = scrollToIndex * itemHeight
    }
  }, [scrollToIndex, itemHeight])

  // Render only the visible items
  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.start, visibleRange.end + 1)
      .map((item, index) => {
        const actualIndex = visibleRange.start + index
        return (
          <div
            key={actualIndex}
            style={{
              position: "absolute",
              top: actualIndex * itemHeight,
              height: itemHeight,
              left: 0,
              right: 0,
            }}
          >
            {renderItem(item, actualIndex)}
          </div>
        )
      })
  }, [items, visibleRange, renderItem, itemHeight])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems}
      </div>
    </div>
  )
}

export default VirtualizedList
