"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AUTH_PATHS } from "@/lib/auth/paths"
import { SuspenseSearchParams } from "@/components/wrappers/suspense-search-params"
import { LoginContent } from "./login-content"

export default function LoginPage() {
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
    <SuspenseSearchParams>
      <LoginContent />
    </SuspenseSearchParams>
  )
}
