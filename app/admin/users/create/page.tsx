"use client"

import { useRouter } from "next/navigation"
import { AdminRegistrationForm } from "@/components/admin/admin-registration-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useSession } from "@/hooks/use-session"
import { UserRole } from "@/lib/auth/constants"
import { useEffect } from "react"
import { AuthLoading } from "@/components/ui/auth-loading"

export default function CreateAdminPage() {
  const router = useRouter()
  const { user, isLoading, hasRole } = useSession()

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && user && !hasRole(UserRole.ADMIN)) {
      router.push("/unauthorized")
    }
  }, [user, isLoading, hasRole, router])

  // Handle successful user creation
  const handleSuccess = () => {
    // Redirect to users list
    router.push("/admin/users")
  }

  // Show loading state
  if (isLoading) {
    return (
      <AuthLoading
        message="Checking permissions"
        description="Please wait while we verify your access rights..."
      />
    )
  }

  // Show nothing if not authenticated or not admin
  if (!user || !hasRole(UserRole.ADMIN)) {
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/users")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>

      <div className="max-w-3xl mx-auto">
        <AdminRegistrationForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
