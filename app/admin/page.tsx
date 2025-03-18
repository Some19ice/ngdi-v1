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

interface DashboardStats {
  userCount: number
  orgCount: number
  metadataCount: number
  activeUsers: number
  pendingApprovals: number
  systemHealth: number
}

async function fetchStats(): Promise<DashboardStats> {
  try {
    console.log("[SERVER] Fetching admin dashboard stats from API")

    // Using the server-side fetch to call the main API server endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard-stats`,
      {
        cache: "no-store",
        next: { revalidate: 60 }, // Revalidate every minute
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SERVER_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      console.error(
        `[SERVER] API error (${response.status}): ${response.statusText}`
      )
      throw new Error(`Failed to fetch stats: ${response.statusText}`)
    }

    const result = await response.json()

    // Check the structure of the response and extract data
    if (result.success && result.data) {
      console.log("[SERVER] Successfully fetched dashboard stats:", result.data)
      return result.data
    }

    console.error("[SERVER] Invalid API response format:", result)
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("[SERVER] Error fetching dashboard stats:", error)
    // Return default values if there's an error
    return {
      userCount: 0,
      orgCount: 0,
      metadataCount: 0,
      activeUsers: 0,
      pendingApprovals: 0,
      systemHealth: 90,
    }
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
              <span
                className={`font-semibold ${getHealthColor(stats.systemHealth)}`}
              >
                {stats.systemHealth}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Users:</span>
              <span className="font-semibold">{stats.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending Approvals:</span>
              <span
                className={`font-semibold ${stats.pendingApprovals > 0 ? "text-amber-600" : "text-green-600"}`}
              >
                {stats.pendingApprovals}
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
            <h3 className="text-2xl font-bold">{stats.userCount}</h3>
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
            <h3 className="text-2xl font-bold">{stats.orgCount}</h3>
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
            <h3 className="text-2xl font-bold">{stats.metadataCount}</h3>
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
            <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
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

// Helper function to get the appropriate color based on health score
function getHealthColor(score: number): string {
  if (score >= 90) return "text-green-600"
  if (score >= 70) return "text-amber-600"
  return "text-red-600"
}
