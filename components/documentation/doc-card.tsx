import Link from "next/link"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DocCardProps {
  title: string
  description: string
  href: string
  icon?: ReactNode
  className?: string
}

export function DocCard({
  title,
  description,
  href,
  icon,
  className,
}: DocCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block group relative rounded-lg border p-6 hover:bg-accent hover:text-accent-foreground shadow-sm transition-colors",
        className
      )}
    >
      <div className="flex items-start">
        {icon && <div className="mr-4 text-muted-foreground">{icon}</div>}
        <div>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-accent-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground group-hover:text-accent-foreground/70">
            {description}
          </p>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.75 6.75L19.25 12L13.75 17.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 12H4.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  )
}
