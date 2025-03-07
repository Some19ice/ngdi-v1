"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProfilePageWrapperProps {
  children: ReactNode
}

export default function ProfilePageWrapper({
  children,
}: ProfilePageWrapperProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/profile")
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    )
  }

  // If authenticated, show the profile content
  if (status === "authenticated" && session?.user) {
    return <>{children}</>
  }

  // Default loading state (should be replaced by the redirect)
  return (
    <div className="flex justify-center items-center min-h-[300px]">
      <LoadingSpinner />
    </div>
  )
}
