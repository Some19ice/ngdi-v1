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

interface AdminNavProps {
  user: {
    id: string | null
    email: string | null
    role: string | null
  }
}

interface DashboardStats {
  userCount: number
  orgCount: number
  metadataCount: number
  activeUsers: number
  pendingApprovals: number
  systemHealth: number
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)

  // Fetch stats for the badges
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)

        // Get the auth token from localStorage or cookie
        const token = localStorage.getItem("auth_token") || ""

        if (!token) {
          console.warn("[CLIENT] No auth token found for admin stats request")
          // Set default stats instead of failing
          setStats({
            userCount: 0,
            orgCount: 0,
            metadataCount: 0,
            activeUsers: 0,
            pendingApprovals: 0,
            systemHealth: 90,
          })
          return
        }

        console.log("[CLIENT] Fetching admin dashboard stats")

        // Use the main API server endpoint
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard-stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (response.ok) {
          const result = await response.json()

          if (result.success && result.data) {
            console.log(
              "[CLIENT] Successfully fetched admin stats:",
              result.data
            )
            setStats(result.data)

            // Set notification count based on pending approvals
            setNotificationCount(result.data.pendingApprovals || 0)
          } else {
            console.error("[CLIENT] Invalid API response format:", result)
            // Set default stats as fallback
            setStats({
              userCount: 0,
              orgCount: 0,
              metadataCount: 0,
              activeUsers: 0,
              pendingApprovals: 0,
              systemHealth: 90,
            })
          }
        } else {
          console.error(
            `[CLIENT] API error (${response.status}): ${response.statusText}`
          )
          // Set default stats as fallback
          setStats({
            userCount: 0,
            orgCount: 0,
            metadataCount: 0,
            activeUsers: 0,
            pendingApprovals: 0,
            systemHealth: 90,
          })
        }
      } catch (error) {
        console.error("[CLIENT] Error fetching admin stats:", error)
        // Set default stats as fallback
        setStats({
          userCount: 0,
          orgCount: 0,
          metadataCount: 0,
          activeUsers: 0,
          pendingApprovals: 0,
          systemHealth: 90,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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
      badge: stats?.userCount,
    },
    {
      value: "/admin/organizations",
      label: "Organizations",
      href: "/admin/organizations",
      icon: <Building2 className="h-4 w-4 mr-2" />,
      badge: stats?.orgCount,
    },
    {
      value: "/admin/metadata",
      label: "All Metadata",
      href: "/admin/metadata",
      icon: <Database className="h-4 w-4 mr-2" />,
      badge: stats?.metadataCount,
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

      <Card className="p-6 bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm">
        <Tabs value={pathname || ""} className="space-y-6">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2 bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-ngdi-green-500 data-[state=active]:text-white hover:bg-gray-100 data-[state=active]:hover:bg-ngdi-green-500/90 rounded-md px-4 py-2 transition-colors relative flex items-center justify-center"
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
