"use client"

import { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to sign in if not authenticated after loading is complete
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin?callbackUrl=/profile")
    }
  }, [user, isLoading, router])

  // Return the layout regardless of auth state (children components will handle auth checks)
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Card className="p-6">
        <ProfileTabs>{children}</ProfileTabs>
      </Card>
    </div>
  )
}
