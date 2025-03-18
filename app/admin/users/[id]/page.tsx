import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Clock,
  Shield,
  FileText,
  Edit,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface UserDetails {
  id: string
  name: string | null
  email: string
  role: UserRole
  organization: string | null
  department: string | null
  phone: string | null
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
  metadataCount: number
  recentActivity: Array<{
    id: string
    title: string
    updatedAt: string
  }>
}

async function fetchUserDetails(userId: string): Promise<UserDetails | null> {
  try {
    // Format userId - handle various UUID formats
    // This removes spaces and ensures dashes are in the right places for a UUID
    let formattedUserId = userId.replace(/\s+/g, "")

    // If the ID has no dashes but is the right length for a UUID, add them in the standard positions
    if (!formattedUserId.includes("-") && formattedUserId.length === 32) {
      formattedUserId =
        formattedUserId.substring(0, 8) +
        "-" +
        formattedUserId.substring(8, 12) +
        "-" +
        formattedUserId.substring(12, 16) +
        "-" +
        formattedUserId.substring(16, 20) +
        "-" +
        formattedUserId.substring(20)
      console.log(`[SERVER] Reformatted UUID: ${formattedUserId}`)
    }

    // Get JWT token for the admin user
    const admin = await requireAuth()
    const { SignJWT } = await import("jose")
    const jwtSecret = process.env.JWT_SECRET || ""
    const secret = new TextEncoder().encode(jwtSecret)

    const token = await new SignJWT({
      userId: admin.id,
      email: admin.email,
      role: "ADMIN",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret)

    // Fetch user details with the admin JWT token and formatted ID
    // Use the main API server in packages/api (note the URL path change)
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${formattedUserId}`
    console.log(`[SERVER] Fetching user details from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`[SERVER] User not found. ID: ${formattedUserId}`)
        return null
      }
      const errorText = await response.text()
      console.error(`[SERVER] API error: ${response.status} - ${errorText}`)
      throw new Error(`Failed to fetch user: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    console.log("[SERVER] API response:", JSON.stringify(result, null, 2))

    if (!result.success || !result.data) {
      console.error("[SERVER] Invalid API response format:", result)
      throw new Error("Invalid API response format")
    }

    return result.data
  } catch (error) {
    console.error(`[SERVER] Error fetching user details:`, error)
    throw error
  }
}

// Helper function to format dates
function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
  } catch (e) {
    return dateString
  }
}

// Helper function to get the appropriate color for role badges
function getRoleBadgeVariant(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "bg-red-100 text-red-800 border-red-200"
    case UserRole.NODE_OFFICER:
      return "bg-blue-100 text-blue-800 border-blue-200"
    case UserRole.USER:
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default async function UserDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  // Server-side authentication check
  const currentUser = await requireAuth()

  // Check if user is admin
  if (currentUser.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access required")
  }

  // Fetch user details
  const userDetails = await fetchUserDetails(params.id)

  // If user not found, show 404 page
  if (!userDetails) {
    console.error(
      `[CLIENT] User with ID "${params.id}" not found. Redirecting to not-found page.`
    )
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/users/${params.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-3 rounded-full">
              {userDetails.image ? (
                <img
                  src={userDetails.image}
                  alt={userDetails.name || "User"}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <UserIcon className="h-16 w-16 text-gray-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">
                {userDetails.name || "Unnamed User"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {userDetails.email}
                {userDetails.emailVerified && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-100 text-green-800 border-green-200"
                  >
                    Verified
                  </Badge>
                )}
              </CardDescription>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={getRoleBadgeVariant(userDetails.role)}
                >
                  {userDetails.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">User Details</TabsTrigger>
              <TabsTrigger value="activity">Activity & Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Contact Information
                    </h3>
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Email
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {userDetails.email}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Phone
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {userDetails.phone || "Not provided"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Organization Details
                    </h3>
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Organization
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {userDetails.organization || "Not specified"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Department
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {userDetails.department || "Not specified"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Account Information
                    </h3>
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Role
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={getRoleBadgeVariant(userDetails.role)}
                          >
                            {userDetails.role}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Member Since
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {format(
                              new Date(userDetails.createdAt),
                              "MMMM d, yyyy"
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Last Updated
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {format(
                              new Date(userDetails.updatedAt),
                              "MMMM d, yyyy"
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Metadata Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userDetails.metadataCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total entries contributed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Account Age
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        (new Date().getTime() -
                          new Date(userDetails.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Since{" "}
                      {format(new Date(userDetails.createdAt), "MMMM d, yyyy")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Last Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userDetails.recentActivity.length > 0
                        ? format(
                            new Date(userDetails.recentActivity[0].updatedAt),
                            "MMM d, yyyy"
                          )
                        : "No activity"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last metadata update
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                {userDetails.recentActivity.length > 0 ? (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metadata Title</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetails.recentActivity.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-medium">
                              {activity.title}
                            </TableCell>
                            <TableCell>
                              {formatDate(activity.updatedAt)}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/metadata/${activity.id}`}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                ) : (
                  <Card className="p-6 text-center text-muted-foreground">
                    No recent activity found for this user.
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
