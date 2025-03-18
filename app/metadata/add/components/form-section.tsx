import { ReactNode } from "react"

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div className={`space-y-4 py-4 ${className}`}>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface FormSectionGridProps {
  columns?: 1 | 2 | 3 | 4
  children: ReactNode
  className?: string
}

export function FormSectionGrid({
  columns = 1,
  children,
  className = "",
}: FormSectionGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 md:gap-6 ${className}`}>
      {children}
    </div>
  )
}

export function FormSectionDivider() {
  return <div className="h-px bg-border/60 my-6" />
}
