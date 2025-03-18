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

interface AdminNavProps {
  user: {
    id: string | null
    email: string | null
    role: string | null
  }
}

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
    badge: "124",
  },
  {
    value: "/admin/organizations",
    label: "Organizations",
    href: "/admin/organizations",
    icon: <Building2 className="h-4 w-4 mr-2" />,
    badge: "15",
  },
  {
    value: "/admin/metadata",
    label: "All Metadata",
    href: "/admin/metadata",
    icon: <Database className="h-4 w-4 mr-2" />,
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

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()

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
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
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
                  {tab.badge && (
                    <Badge className="ml-2 bg-gray-200 text-gray-800 hover:bg-gray-300">
                      {tab.badge}
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
