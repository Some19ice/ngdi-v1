"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LayoutDashboard,
  Users,
  Building2,
  Database,
  BarChart4,
  Settings,
  Bell,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

// Helper function to get cookie by name
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface AdminNavProps {
  user: {
    id: string | null
    email: string | null
    role: string | null
  }
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

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Fetch stats for the badges
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        // Get token from localStorage or cookies
        let authToken = localStorage.getItem("accessToken")

        // If no token in localStorage, try to get from cookies
        if (!authToken) {
          authToken = getCookie("auth_token")
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

        // Get the API base URL from env
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""

        // Construct the correct API URL
        const statsUrl = `${apiUrl}/admin/dashboard-stats`
        console.log("Fetching admin stats from:", statsUrl)

        const response = await fetch(statsUrl, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          cache: "no-store",
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Authentication error. Please log in again.")
          }

          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Failed to fetch stats")
        }

        const result = await response.json()
        console.log("API Response:", result) // Debug log to see the response

        // Set stats from the response
        if (result && typeof result === "object") {
          // If the API returns a data wrapper
          const statsData = result.data || result

          setStats({
            totalUsers: statsData.totalUsers || 0,
            totalMetadata: statsData.totalMetadata || 0,
            userRoleDistribution: statsData.userRoleDistribution || [],
            recentMetadataCount: statsData.recentMetadataCount || 0,
            userGrowthPoints: statsData.userGrowthPoints || 0,
            metadataByFrameworkCount: statsData.metadataByFrameworkCount || 0,
            topOrganizationsCount: statsData.topOrganizationsCount || 0,
          })

          // Calculate notification count if available
          if (
            statsData.userRoleDistribution &&
            Array.isArray(statsData.userRoleDistribution)
          ) {
            const pendingApprovals = statsData.userRoleDistribution.reduce(
              (acc: number, curr: UserRoleDistribution) =>
                acc + (curr._count?.id || 0),
              0
            )
            setNotificationCount(pendingApprovals)
          }
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        setError(
          error instanceof Error ? error.message : "Failed to fetch stats"
        )
        // Set default values if there's an error
        setStats({
          totalUsers: 0,
          totalMetadata: 0,
          userRoleDistribution: [],
          recentMetadataCount: 0,
          userGrowthPoints: 0,
          metadataByFrameworkCount: 0,
          topOrganizationsCount: 0,
        })
        setNotificationCount(0)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch stats if we have a user
    if (user && user.id) {
      fetchStats()
    }
  }, [user]) // Run when user changes

  // Create tabs with dynamic badges from stats
  const tabs = [
    {
      value: "/admin",
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
    },
    {
      value: "/admin/users",
      label: "Users",
      href: "/admin/users",
      icon: <Users className="h-4 w-4 mr-2" />,
      badge: stats?.totalUsers,
    },
    {
      value: "/admin/organizations",
      label: "Organizations",
      href: "/admin/organizations",
      icon: <Building2 className="h-4 w-4 mr-2" />,
      badge: stats?.topOrganizationsCount,
    },
    {
      value: "/admin/metadata",
      label: "All Metadata",
      href: "/admin/metadata",
      icon: <Database className="h-4 w-4 mr-2" />,
      badge: stats?.totalMetadata,
    },
    {
      value: "/admin/analytics",
      label: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart4 className="h-4 w-4 mr-2" />,
    },
    {
      value: "/admin/settings",
      label: "System Settings",
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Welcome, {user.email?.split("@")[0] || "Admin"}
          </p>
        </div>
        <div className="relative">
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <Card className="p-6 bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm">
        <Tabs value={pathname || ""} className="space-y-6">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2 bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-gray-600 hover:text-ngdi-green-500 data-[state=active]:bg-ngdi-green-500 data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-ngdi-green-500/90 rounded-md px-4 py-2 transition-colors relative flex items-center justify-center"
                asChild
              >
                <Link href={tab.href} className="flex items-center">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <Badge className="ml-2 bg-gray-200 text-gray-800 hover:bg-gray-300 data-[state=active]:bg-white data-[state=active]:text-ngdi-green-700">
                      {loading ? "..." : tab.badge}
                    </Badge>
                  )}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>
    </div>
  )
}
