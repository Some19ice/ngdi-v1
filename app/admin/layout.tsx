"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { UserRole, Permissions } from "@/lib/auth/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, can } = useAuth({
    // TODO: Replace with actual user data
    user: {
      id: "1",
      email: "user@example.com",
      role: UserRole.ADMIN,
      organizationId: "1",
    },
  })

  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/403")
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
      permission: Permissions.READ_USER,
    },
    {
      value: "/admin/organizations",
      label: "Organizations",
      href: "/admin/organizations",
      permission: Permissions.MANAGE_ORGANIZATION,
    },
    {
      value: "/admin/metadata",
      label: "All Metadata",
      href: "/admin/metadata",
      permission: Permissions.READ_METADATA,
    },
    {
      value: "/admin/settings",
      label: "System Settings",
      href: "/admin/settings",
      permission: Permissions.MANAGE_SETTINGS,
    },
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, organizations, and system settings
        </p>
      </div>

      <Card className="p-6">
        <Tabs value={pathname} className="space-y-6">
          <TabsList className="w-full justify-start h-auto gap-2 bg-transparent p-0">
            {tabs.map(
              (tab) =>
                (!tab.permission || can(tab.permission)) && (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-ngdi-green-500 data-[state=active]:text-white rounded-md px-4 py-2"
                    asChild
                  >
                    <a href={tab.href}>{tab.label}</a>
                  </TabsTrigger>
                )
            )}
          </TabsList>
          {children}
        </Tabs>
      </Card>
    </div>
  )
}
