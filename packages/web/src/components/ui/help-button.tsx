"use client"

import React, { useState } from "react"
import {
  HelpCircle,
  BookOpen,
  Search,
  MessageSquare,
  ExternalLink,
  X,
  ChevronRight,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface HelpLink {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  external?: boolean
}

export function HelpButton() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Common help links
  const helpLinks: HelpLink[] = [
    {
      title: "User Guide",
      description: "Learn how to use the NGDI Portal",
      href: "/documentation/user-guide",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Getting Started",
      description: "Quick introduction to key features",
      href: "/documentation/getting-started",
      icon: <ChevronRight className="h-4 w-4" />,
    },
    {
      title: "Search Documentation",
      description: "Find specific help topics",
      href: "/documentation/search",
      icon: <Search className="h-4 w-4" />,
    },
    {
      title: "Contact Support",
      description: "Get help from our team",
      href: "/support",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ]

  // Context-specific help based on current path
  const getContextualHelp = (): HelpLink | null => {
    if (pathname?.includes("/metadata/add")) {
      return {
        title: "Metadata Guide",
        description: "Learn about creating effective metadata",
        href: "/documentation/metadata-guide",
        icon: <BookOpen className="h-4 w-4" />,
      }
    }

    if (pathname?.includes("/map")) {
      return {
        title: "Map Visualization",
        description: "How to use the map tools effectively",
        href: "/documentation/map-guide",
        icon: <BookOpen className="h-4 w-4" />,
      }
    }

    if (pathname?.includes("/search")) {
      return {
        title: "Search Tips",
        description: "Advanced search techniques",
        href: "/documentation/search-guide",
        icon: <BookOpen className="h-4 w-4" />,
      }
    }

    return null
  }

  const contextualHelp = getContextualHelp()
  const allLinks = contextualHelp ? [contextualHelp, ...helpLinks] : helpLinks

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 help-resources"
          aria-label="Help and resources"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Help & Resources</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="divide-y">
          {allLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="flex items-start p-4 hover:bg-gray-50 transition-colors"
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={() => setOpen(false)}
            >
              <div className="mr-3 mt-0.5 text-primary">{link.icon}</div>
              <div>
                <h4 className="font-medium flex items-center">
                  {link.title}
                  {link.external && <ExternalLink className="ml-1 h-3 w-3" />}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="p-4 bg-gray-50">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/documentation">Browse All Documentation</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
