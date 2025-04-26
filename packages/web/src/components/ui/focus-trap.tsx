import * as React from "react"
import { useEffect, useRef } from "react"

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  initialFocus?: boolean
}

export function FocusTrap({
  children,
  active = true,
  initialFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusableElement = focusableElements[0]
    const lastFocusableElement = focusableElements[focusableElements.length - 1]

    // Set initial focus
    if (initialFocus && firstFocusableElement) {
      firstFocusableElement.focus()
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // If shift key pressed for shift + tab combination
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault()
          lastFocusableElement.focus()
        }
      } else {
        // If tab key pressed
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault()
          firstFocusableElement.focus()
        }
      }
    }

    container.addEventListener("keydown", handleKeyDown)

    return () => {
      container.removeEventListener("keydown", handleKeyDown)
    }
  }, [active, initialFocus])

  return (
    <div ref={containerRef} className="contents">
      {children}
    </div>
  )
}
