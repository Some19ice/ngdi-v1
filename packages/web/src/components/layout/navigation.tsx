import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NavigationProps {
  items: {
    title: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

export function Navigation({ items }: NavigationProps) {
  const pathname = usePathname()

  return (
    <ScrollArea className="my-4">
      <nav
        className="flex flex-col space-y-1"
        role="navigation"
        aria-label="Main navigation"
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-muted"
              )}
              asChild
            >
              <Link
                href={item.href}
                className="flex items-center"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" aria-hidden="true" />}
                <span>{item.title}</span>
              </Link>
            </Button>
          )
        })}
      </nav>
    </ScrollArea>
  )
}
