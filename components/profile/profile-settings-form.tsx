"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type Profile } from "./types"
import { updateUserProfile } from "@/app/api/actions/profile"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProfileSettingsFormProps {
  profile: Profile
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePreferenceChange = async (
    key: keyof Profile["preferences"],
    value: boolean
  ) => {
    if (!profile) return

    try {
      setIsUpdating(true)
      setError(null)

      // Create a copy of the current preferences and update the specific one
      const updatedPreferences = {
        ...profile.preferences,
        [key]: value,
      }

      const result = await updateUserProfile({
        preferences: updatedPreferences,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to update preferences")
      }

      toast({
        title: "Settings updated",
        description: "Your preferences have been updated successfully.",
      })

      // Revalidate and refresh the page to show updated data
      router.refresh()
    } catch (err) {
      console.error("Failed to update preferences:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update preferences"

      setError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordChange = () => {
    // Redirect to password change page
    router.push("/auth/change-password")
  }

  const handleDeleteAccount = async () => {
    toast({
      title: "Not implemented",
      description: "Account deletion is not yet implemented.",
    })
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h3 className="font-medium text-destructive">
            Error updating settings
          </h3>
        </div>
        <p className="mt-2 text-sm text-destructive/90">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setError(null)}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-notifications">
              Receive email notifications
            </Label>
            <Switch
              id="email-notifications"
              checked={profile.preferences.emailNotifications}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handlePreferenceChange("emailNotifications", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="newsletter">Subscribe to newsletter</Label>
            <Switch
              id="newsletter"
              checked={profile.preferences.newsletter}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handlePreferenceChange("newsletter", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="2fa">Two-factor authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="2fa"
              checked={profile.preferences.twoFactorEnabled}
              disabled={isUpdating}
              onCheckedChange={(checked) =>
                handlePreferenceChange("twoFactorEnabled", checked)
              }
            />
          </div>
          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handlePasswordChange}
              disabled={isUpdating}
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={isUpdating}
              >
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
