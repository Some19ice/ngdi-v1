"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  },
  {
    value: "/admin/users",
    label: "Users",
    href: "/admin/users",
  },
  {
    value: "/admin/organizations",
    label: "Organizations",
    href: "/admin/organizations",
  },
  {
    value: "/admin/metadata",
    label: "All Metadata",
    href: "/admin/metadata",
  },
  {
    value: "/admin/analytics",
    label: "Analytics",
    href: "/admin/analytics",
  },
  {
    value: "/admin/settings",
    label: "System Settings",
    href: "/admin/settings",
  },
]

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Welcome, {user.email?.split("@")[0] || "Admin"}
        </p>
      </div>

      <Card className="p-6">
        <Tabs value={pathname || ""} className="space-y-6">
          <TabsList className="w-full justify-start h-auto gap-2 bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-ngdi-green-500 data-[state=active]:text-white rounded-md px-4 py-2"
                asChild
              >
                <Link href={tab.href}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Card>
    </div>
  )
}
