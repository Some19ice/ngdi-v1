import { Suspense } from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
// Import dynamic configuration
import { dynamic } from "./page-config"
import { format } from "date-fns"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { ProfileCard } from "@/components/profile"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { UserRole } from "@/lib/auth/constants"
import { formatSupabaseUserToProfile } from "@/components/profile/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Calendar,
  MapPin,
  FileText,
  Settings,
  User,
} from "lucide-react"
import { ProfileStatisticsSection } from "@/components/profile/profile-statistics"

export const metadata: Metadata = {
  title: "My Profile | NGDI Portal",
  description: "View and manage your NGDI profile settings and information",
}

// Mock data function for development since we don't have access to the actual DB schema
async function fetchProfileData(userId: string) {
  try {
    // Fetch basic user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userData) {
      return null
    }

    // For development - return mock data that matches our UI
    return {
      user: {
        ...userData,
        lastLoginAt: new Date(),
        metadata: {
          location: "Abuja, Nigeria",
        },
        activities: [
          {
            id: "1",
            description: "Downloaded NGDI Standards and Guidelines document",
            createdAt: new Date(Date.now() - 86400000),
          },
          {
            id: "2",
            description: "Updated profile information",
            createdAt: new Date(Date.now() - 172800000),
          },
          {
            id: "3",
            description:
              "Contributed to metadata for Lagos urban planning dataset",
            createdAt: new Date(Date.now() - 345600000),
          },
        ],
        downloadStats: [
          {
            id: "1",
            documentName: "NGDI Standards and Guidelines (2024)",
            timestamp: new Date(Date.now() - 86400000),
          },
          {
            id: "2",
            documentName: "Metadata Management Protocol",
            timestamp: new Date(Date.now() - 604800000),
          },
        ],
      },
      stats: {
        downloads: 12,
        uploads: 3,
        contributions: 5,
      },
    }
  } catch (error) {
    console.error("Error fetching profile data:", error)
    return null
  }
}

export default async function ProfilePage() {
  // Server-side authentication check
  const user = await requireAuth("/profile")

  // Fetch enhanced profile data
  const profileData = await fetchProfileData(user.id)

  if (!profileData) {
    notFound()
  }

  // Format the user data to match Profile interface
  const typedUser = {
    ...user,
    role: user.role as UserRole,
  }

  const formattedProfile = formatSupabaseUserToProfile(typedUser)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Badge variant="outline" className="px-3 py-1">
          {formattedProfile.role}
        </Badge>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[300px]">
            <LoadingSpinner />
          </div>
        }
      >
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProfileCard profile={formattedProfile} isEditable />
              </div>

              <div className="space-y-6">
                <ProfileStatisticsSection
                  downloads={profileData.stats.downloads}
                  uploads={profileData.stats.uploads}
                  contributions={profileData.stats.contributions}
                />

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-medium">Account Information</h3>
                    <CardDescription>
                      Details about your NGDI account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Member since:
                      </span>
                      <span className="text-sm font-medium">
                        {format(profileData.user.createdAt, "MMMM d, yyyy")}
                      </span>
                    </div>

                    {profileData.user.lastLoginAt && (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Last active:
                        </span>
                        <span className="text-sm font-medium">
                          {format(profileData.user.lastLoginAt, "MMMM d, yyyy")}
                        </span>
                      </div>
                    )}

                    {profileData.user.metadata?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Location:
                        </span>
                        <span className="text-sm font-medium">
                          {profileData.user.metadata.location}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Recent Activity</h3>
                <CardDescription>
                  Your recent actions and interactions with the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileData.user.activities &&
                profileData.user.activities.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.user.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                      >
                        <Activity className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              activity.createdAt,
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No recent activity to display
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">My Documents</h3>
                <CardDescription>
                  Documents you&apos;ve downloaded or contributed to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileData.user.downloadStats &&
                profileData.user.downloadStats.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.user.downloadStats.map((download) => (
                      <div
                        key={download.id}
                        className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                      >
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {download.documentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Downloaded on{" "}
                            {format(download.timestamp, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No documents downloaded yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Profile Settings</h3>
                <CardDescription>
                  Manage your account preferences and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Visit the{" "}
                  <a
                    href="/profile/edit"
                    className="text-primary hover:underline"
                  >
                    Edit Profile
                  </a>{" "}
                  page to update your personal information.
                </p>

                <p className="text-muted-foreground text-sm">
                  Visit the{" "}
                  <a
                    href="/profile/settings"
                    className="text-primary hover:underline"
                  >
                    Account Settings
                  </a>{" "}
                  page to manage your notification preferences and security
                  settings.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  )
}
