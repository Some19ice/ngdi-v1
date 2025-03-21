import { ReactNode } from "react"

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

interface FormSectionGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
}

export function FormSectionGrid({
  children,
  columns = 2,
}: FormSectionGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>{children}</div>
  )
}

export function FormSectionDivider() {
  return <div className="my-6 border-t border-border" />
}
