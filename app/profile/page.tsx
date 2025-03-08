"use client"

import { Suspense } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ProfileCard } from "@/components/profile"
import {
  Profile,
  formatSupabaseUserToProfile,
} from "@/components/profile/types"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const { toast } = useToast()

  // When user data is available, create a profile from it
  useEffect(() => {
    if (user) {
      try {
        const formattedProfile = formatSupabaseUserToProfile(user)
        setProfile(formattedProfile)
      } catch (error) {
        console.error("Error formatting profile:", error)
        toast({
          title: "Error",
          description: "Could not format profile data",
          variant: "destructive",
        })
      }
    }
  }, [user, toast])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="space-y-8">
        <div className="rounded-md bg-yellow-50 p-4">
          <h2 className="text-lg font-semibold text-yellow-800">
            Not Authenticated
          </h2>
          <p className="text-yellow-700 mb-4">
            Please sign in to view your profile.
          </p>
          <div className="mt-4">
            <a
              href="/auth/signin"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  // User authenticated but profile not yet formatted
  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    )
  }

  // Show the profile
  return (
    <div className="space-y-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[300px]">
            <LoadingSpinner />
          </div>
        }
      >
        <ProfileCard profile={profile} isEditable />
      </Suspense>
    </div>
  )
}
