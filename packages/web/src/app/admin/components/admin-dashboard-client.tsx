"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  Building2,
  Database,
  BarChart4,
  Settings,
  AlertCircle,
  Activity,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { adminGet } from "@/lib/api/admin-fetcher"
import { useAuthSession } from "@/hooks/use-auth-session"

// Helper function to get cookie by name
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

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

export function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{
    id: string
    email: string
    role: string
  } | null>(null)

  // Get user from auth session
  const { user: authUser, isAuthenticated } = useAuthSession()

  // Set user when auth session changes
  useEffect(() => {
    if (isAuthenticated && authUser) {
      setUser({
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
      })
    }
  }, [authUser, isAuthenticated])

  // Fetch stats for the dashboard
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        // Get the API base URL from env and construct the proper endpoint URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
        const statsUrl = `${apiUrl}/admin/dashboard-stats`
        console.log("Fetching dashboard stats from:", statsUrl)

        try {
          // Get token from localStorage or cookies
          let authToken = localStorage.getItem("accessToken")

          // If no token in localStorage, try to get from cookies
          if (!authToken && typeof document !== "undefined") {
            const cookieValue = document.cookie
              .split("; ")
              .find((row) => row.startsWith("auth_token="))
            if (cookieValue) {
              authToken = cookieValue.split("=")[1]
            }
          }

          // If still no token, use a fallback for development
          if (!authToken && process.env.NODE_ENV === "development") {
            console.warn("No auth token found, using fallback empty stats")
            setStats({
              totalUsers: 0,
              totalMetadata: 0,
              userRoleDistribution: [],
              recentMetadataCount: 0,
              userGrowthPoints: 0,
              metadataByFrameworkCount: 0,
              topOrganizationsCount: 0,
            })
            setLoading(false)
            return
          }

          if (!authToken) {
            throw new Error("No authentication token found")
          }

          // Make the request with the auth token
          const response = await fetch(statsUrl, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            cache: "no-store",
          })

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
          }

          const result = await response.json()

          if (result && result.totalUsers !== undefined) {
            setStats(result)
          } else {
            throw new Error("Invalid response format")
          }
        } catch (error) {
          console.error("Error response from dashboard stats:", error)
          setError("Failed to fetch dashboard stats. Please try again later.")
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        setError(
          "Failed to fetch stats. Please check your connection and try again."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Calculate derived stats
  const activeUsers =
    stats?.userRoleDistribution.reduce(
      (sum, item) => sum + item._count.id,
      0
    ) || 0

  const pendingApprovals = 0 // Update this if you have a pending approvals field
  const systemHealth = 90 // Default health score

  if (loading) {
    return <div className="text-center p-6">Loading dashboard data...</div>
  }

  // Error notification banner
  const errorBanner = error ? (
    <div className="bg-amber-50 p-4 rounded-md text-amber-800 mb-6">
      <p className="font-medium">{error}</p>
    </div>
  ) : null

  if (!stats) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm mt-1">Could not load dashboard data</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  // Function to get health color
  function getHealthColor(score: number): string {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-8">
      {errorBanner}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin welcome card */}
        <Card className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Welcome, {user?.email?.split("@")[0] || "Admin"}
          </h2>
          <p className="text-muted-foreground">Role: {user?.role}</p>
          <p className="text-muted-foreground">
            Is Admin: {user?.role === "ADMIN" ? "Yes" : "No"}
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
            <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
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
              {stats?.topOrganizationsCount || 0}
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
            <h3 className="text-2xl font-bold">{stats?.totalMetadata || 0}</h3>
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
    </div>
  )
}
