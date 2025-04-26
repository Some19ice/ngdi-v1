"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type Profile } from "./types"
import { updateUserProfile } from "@/app/actions/profile"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Moon, Sun, Monitor } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"

interface ProfileSettingsFormProps {
  profile: Profile
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock login history data - in a real app, this would come from your backend
  const [loginHistory] = useState([
    {
      id: 1,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      device: "Chrome / macOS",
      location: "San Francisco, CA",
    },
    {
      id: 2,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      device: "Safari / iOS",
      location: "San Francisco, CA",
    },
    {
      id: 3,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      device: "Chrome / Windows",
      location: "New York, NY",
    },
  ])

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  const handleExportData = () => {
    toast({
      title: "Preparing data export",
      description: "Your data will be emailed to you when ready.",
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
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup
                defaultValue={theme || "system"}
                onValueChange={setTheme}
                className="flex space-x-1"
              >
                <div className="flex flex-col items-center space-y-1">
                  <RadioGroupItem
                    value="light"
                    id="theme-light"
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="theme-light"
                    className="p-2 rounded-md cursor-pointer border peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted"
                  >
                    <Sun className="h-5 w-5" />
                  </Label>
                  <span className="text-xs">Light</span>
                </div>

                <div className="flex flex-col items-center space-y-1">
                  <RadioGroupItem
                    value="dark"
                    id="theme-dark"
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="theme-dark"
                    className="p-2 rounded-md cursor-pointer border peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted"
                  >
                    <Moon className="h-5 w-5" />
                  </Label>
                  <span className="text-xs">Dark</span>
                </div>

                <div className="flex flex-col items-center space-y-1">
                  <RadioGroupItem
                    value="system"
                    id="theme-system"
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="theme-system"
                    className="p-2 rounded-md cursor-pointer border peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted"
                  >
                    <Monitor className="h-5 w-5" />
                  </Label>
                  <span className="text-xs">System</span>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>Recent logins to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loginHistory.length > 0 ? (
              <div className="space-y-4">
                {loginHistory.map((login) => (
                  <div
                    key={login.id}
                    className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{formatDate(login.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {login.device}
                      </p>
                    </div>
                    <div className="text-sm text-right">
                      <p>{login.location}</p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="link"
                  className="px-0 text-sm"
                  onClick={() => router.push("/profile/security/activity")}
                >
                  View full activity log
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No recent activity found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleExportData}
          >
            Export Account Data
          </Button>
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
