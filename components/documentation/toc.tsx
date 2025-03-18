"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TOCItem {
  id: string
  level: number
  text: string
}

interface TOCProps {
  className?: string
}

export function TOC({ className }: TOCProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll<HTMLElement>("h2, h3")
    )

    // Add IDs to headings that don't have them
    headingElements.forEach((heading) => {
      if (!heading.id) {
        const id =
          heading.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") ??
          `heading-${Math.random().toString(36).substring(2, 9)}`

        heading.id = id
      }
    })

    const headingItems = headingElements.map((heading) => ({
      id: heading.id,
      level: parseInt(heading.tagName.substring(1), 10), // Get the heading level from the tag (h2 = 2, h3 = 3)
      text: heading.textContent || "",
    }))

    setHeadings(headingItems)

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }

    const observerOptions = {
      rootMargin: "0px 0px -80% 0px",
      threshold: 0,
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    headingElements.forEach((element) => {
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className={cn("relative", className)}>
      <div className="sticky top-16 overflow-y-auto max-h-[calc(100vh-4rem)] pb-10">
        <div className="space-y-2">
          <p className="font-medium">On this page</p>
          <ul className="space-y-2 text-sm">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={cn(
                    "block text-muted-foreground hover:text-foreground transition-colors py-1",
                    heading.level === 3 && "pl-4",
                    activeId === heading.id && "text-primary font-medium"
                  )}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
