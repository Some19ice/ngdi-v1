import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import {
  Users,
  Building2,
  Database,
  BarChart4,
  Settings,
  AlertCircle,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserRoleDistribution {
  _count: { id: number }
  role: string
}

interface DashboardStats {
  totalUsers: number
  totalMetadata: number
  userRoleDistribution: UserRoleDistribution[]
  recentMetadataCount: number
  userGrowthPoints: number
  metadataByFrameworkCount: number
  topOrganizationsCount: number
}

async function fetchStats(): Promise<DashboardStats> {
  try {
    // Get the current authenticated user from requireAuth
    const user = await requireAuth()

    console.log("[SERVER] Admin user:", {
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // If the user is an admin, we can directly use their JWT token to call the API
    // First, we need to get a fresh JWT token for the current user
    const jwt = await getJWT(user)

    if (!jwt) {
      console.log("[SERVER] Failed to generate JWT token")
      throw new Error("Failed to get authentication token")
    }

    console.log(
      "[SERVER] Successfully obtained admin JWT token, length:",
      jwt.length
    )
    console.log(
      "[SERVER] Fetching stats from:",
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard-stats`
    )

    // Use the JWT token to call the admin dashboard stats API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard-stats`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[SERVER] Error fetching stats:", response.status, errorText)
      throw new Error(
        `Failed to fetch stats: ${response.status} - ${errorText}`
      )
    }

    const result = await response.json()
    console.log("[SERVER] Dashboard stats API response:", result)

    // The API returns the stats object directly
    if (result && result.totalUsers !== undefined) {
      console.log("[SERVER] Successfully fetched admin stats")
      return result
    }

    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    // Return default values if there's an error
    return {
      totalUsers: 0,
      totalMetadata: 0,
      userRoleDistribution: [],
      recentMetadataCount: 0,
      userGrowthPoints: 0,
      metadataByFrameworkCount: 0,
      topOrganizationsCount: 0,
    }
  }
}

// Helper function to generate a JWT token for the current user
async function getJWT(user: any): Promise<string | null> {
  try {
    // Create a JWT token for the authenticated admin user
    const { SignJWT } = await import("jose")
    const jwtSecret = process.env.JWT_SECRET || ""
    const secret = new TextEncoder().encode(jwtSecret)

    // Ensure the role is in the correct format for the API auth middleware
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role, // Use the user's actual role from the auth context
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret)

    return token
  } catch (error) {
    console.error("Error generating JWT token:", error)
    return null
  }
}

export default async function AdminPage() {
  // Server-side authentication check
  const user = await requireAuth()

  // Check if user is admin
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access required")
  }

  // Fetch real statistics from our API
  const stats = await fetchStats()

  // Calculate derived stats
  const activeUsers = stats.userRoleDistribution.reduce(
    (sum, item) => sum + item._count.id,
    0
  )

  const pendingApprovals = 0 // Update this if you have a pending approvals field

  const systemHealth = 90 // Default health score

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin welcome card */}
        <Card className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Welcome, {user.email?.split("@")[0] || "Admin"}
          </h2>
          <p className="text-muted-foreground">Role: {user.role}</p>
          <p className="text-muted-foreground">
            Is Admin: {user.role === UserRole.ADMIN ? "Yes" : "No"}
          </p>
        </Card>

        {/* Quick actions card */}
        <Card className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-ngdi-green-500" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/users">Manage Users</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/organizations">View Organizations</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/settings">System Settings</Link>
            </Button>
          </div>
        </Card>

        {/* System health card */}
        <Card className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-ngdi-green-500" />
            System Health
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Health Score:</span>
              <span className={`font-semibold ${getHealthColor(systemHealth)}`}>
                {systemHealth}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Users:</span>
              <span className="font-semibold">{activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending Approvals:</span>
              <span
                className={`font-semibold ${pendingApprovals > 0 ? "text-amber-600" : "text-green-600"}`}
              >
                {pendingApprovals}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">System Overview</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Statistics cards */}
        <Card className="rounded-lg border p-6 shadow-sm flex items-center gap-4">
          <div className="bg-ngdi-green-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-ngdi-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Users
            </p>
            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
          </div>
        </Card>

        <Card className="rounded-lg border p-6 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Organizations
            </p>
            <h3 className="text-2xl font-bold">
              {stats.topOrganizationsCount}
            </h3>
          </div>
        </Card>

        <Card className="rounded-lg border p-6 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <Database className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Metadata Entries
            </p>
            <h3 className="text-2xl font-bold">{stats.totalMetadata}</h3>
          </div>
        </Card>

        <Card className="rounded-lg border p-6 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <BarChart4 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              User Activity
            </p>
            <h3 className="text-2xl font-bold">{activeUsers}</h3>
          </div>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          variant="default"
          className="bg-blue-500 hover:bg-blue-600"
          asChild
        >
          <Link href="/admin-debug">Go to Admin Debug Page</Link>
        </Button>
      </div>
    </div>
  )
}

function getHealthColor(score: number): string {
  if (score >= 90) return "text-green-600"
  if (score >= 70) return "text-amber-600"
  return "text-red-600"
}
