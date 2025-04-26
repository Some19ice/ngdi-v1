"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/hooks/use-auth-session"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProfilePageWrapperProps {
  children: ReactNode
}

export default function ProfilePageWrapper({
  children,
}: ProfilePageWrapperProps) {
  const { session, status, user, isLoading } = useAuthSession()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin?returnUrl=/profile")
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If authenticated, render the children
  return <>{children}</>
}
