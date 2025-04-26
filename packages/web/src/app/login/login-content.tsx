"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AUTH_PATHS } from "@/lib/auth/paths"

export function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get("returnUrl") || null

  useEffect(() => {
    // Redirect to the signin page with the return URL if provided
    if (returnUrl) {
      router.push(
        `${AUTH_PATHS.SIGNIN}?returnUrl=${encodeURIComponent(returnUrl)}`
      )
    } else {
      router.push(AUTH_PATHS.SIGNIN)
    }
  }, [router, returnUrl])

  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className="ml-2 text-muted-foreground">Redirecting to login...</p>
    </div>
  )
}
