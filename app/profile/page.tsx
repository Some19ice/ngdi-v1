import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ProfileCard } from "@/components/profile"
import { requireAuth } from "@/lib/auth"
import { ProfileClient } from "./profile-client"
import { UserRole } from "@/lib/auth/constants"

export default async function ProfilePage() {
  // Server-side authentication check
  const user = await requireAuth("/profile")

  // Ensure the role is properly typed as UserRole from constants
  const typedUser = {
    ...user,
    role: user.role as UserRole,
  }

  return (
    <div className="space-y-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[300px]">
            <LoadingSpinner />
          </div>
        }
      >
        <ProfileClient initialUser={typedUser} />
      </Suspense>
    </div>
  )
}
