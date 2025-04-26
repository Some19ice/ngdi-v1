"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export function AdminBreadcrumb() {
  const pathname = usePathname() || "/admin"

  // Skip if we're on the main admin page
  if (pathname === "/admin") {
    return null
  }

  // Split the pathname and create breadcrumb segments
  const segments = pathname.split("/").filter(Boolean)

  // Generate breadcrumb paths
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    return {
      label:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href,
      isCurrent: index === segments.length - 1,
    }
  })

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex items-center gap-1">
        <li>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-ngdi-green-500 hover:text-ngdi-green-600"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />

            {breadcrumb.isCurrent ? (
              <span className="font-medium text-foreground" aria-current="page">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="text-ngdi-green-500 hover:text-ngdi-green-600"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
