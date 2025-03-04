import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Mail, MapPin, Building, Edit } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile settings and preferences.",
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container max-w-6xl py-6">
      <div className="grid gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile settings and preferences.
            </p>
          </div>
          <Button asChild>
            <Link href="/profile/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Email</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{user.organization || "Not specified"}</p>
                    <p className="text-xs text-muted-foreground">
                      Organization
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{user.department || "Not specified"}</p>
                    <p className="text-xs text-muted-foreground">Department</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Member since
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-4">
            <Tabs defaultValue="metadata" className="h-full w-full">
              <TabsList className="w-full">
                <TabsTrigger value="metadata" className="flex-1">
                  My Metadata
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="metadata" className="h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>My Metadata</CardTitle>
                    <CardDescription>
                      Manage your metadata entries and submissions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Add metadata list component here */}
                    <p className="text-sm text-muted-foreground">
                      No metadata entries found.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activity" className="h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent actions and updates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Add activity list component here */}
                    <p className="text-sm text-muted-foreground">
                      No recent activity.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="h-full">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Settings</CardTitle>
                      <CardDescription>
                        Manage your account settings and preferences.
                      </CardDescription>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/profile/settings">
                        View All Settings
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2 font-medium">Account Security</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Password</span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/reset-password">
                            Change
                          </Link>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Two-factor authentication</span>
                        <Button variant="outline" size="sm" disabled>
                          Setup
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
