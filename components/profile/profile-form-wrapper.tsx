"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProfileForm } from "./profile-form"
import { type Profile, type ProfileFormValues } from "./types"
import { updateUserProfile } from "@/app/api/actions/profile"
import { updateSupabaseProfile } from "@/lib/supabase-profile"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfileFormWrapperProps {
  profile: Profile
}

export function ProfileFormWrapper({ profile }: ProfileFormWrapperProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      setError(null)

      // First try the Supabase update
      const supabaseResult = await updateSupabaseProfile(values)

      // If Supabase update fails or isn't available, fall back to the server action
      if (!supabaseResult.success) {
        const result = await updateUserProfile(values)
        if (!result.success) {
          throw new Error(result.error || "Failed to update profile")
        }
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      // Refresh the router to update the UI
      router.refresh()

      // Navigate back to profile page
      router.push("/profile")
    } catch (err) {
      console.error("Failed to update profile:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile"

      setError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold text-destructive">
            Error Updating Profile
          </h2>
        </div>
        <p className="mt-2 text-sm">{error}</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => setError(null)} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => router.push("/profile")} variant="ghost">
            Back to Profile
          </Button>
        </div>
      </div>
    )
  }

  return <ProfileForm profile={profile} onSubmit={handleSubmit} />
}
