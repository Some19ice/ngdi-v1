import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingStateProps {
  className?: string
}

export function TableRowSkeleton({ className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center space-x-4 rounded-md border p-4",
        className
      )}
    >
      <Skeleton className="h-12 w-12" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}

export function CardSkeleton({ className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function FormSkeleton({ className }: LoadingStateProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-20 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}

export function MetadataDetailsSkeleton({ className }: LoadingStateProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export function MapSkeleton({ className }: LoadingStateProps) {
  return (
    <div className={cn("relative h-[400px] w-full rounded-lg", className)}>
      <Skeleton className="h-full w-full" />
      <div className="absolute right-4 top-4 space-y-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  )
}
