"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"

export default function ProfileMetadataPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to metadata page if user is authenticated
    if (!isLoading && user) {
      router.push("/metadata")
    } else if (!isLoading && !user) {
      // Redirect to login if not authenticated
      router.push("/login?returnUrl=/metadata")
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-40 w-full rounded-md" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
