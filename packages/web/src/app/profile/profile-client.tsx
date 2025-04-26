"use client"

import { useEffect, useState } from "react"
import { ProfileCard } from "@/components/profile"
import {
  Profile,
  formatSupabaseUserToProfile,
} from "@/components/profile/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/components/ui/use-toast"
import { UserRole } from "@/lib/auth/constants"

interface ProfileClientProps {
  initialUser: {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const { toast } = useToast()

  // When user data is available, create a profile from it
  useEffect(() => {
    if (initialUser) {
      try {
        const formattedProfile = formatSupabaseUserToProfile(initialUser)
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
  }, [initialUser, toast])

  // User authenticated but profile not yet formatted
  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    )
  }

  // Show the profile
  return <ProfileCard profile={profile} isEditable />
}
