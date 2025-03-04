"use client"

import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { UserRole, Permissions } from "@/lib/auth/types"
import { redirect } from "next/navigation"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, can } = useAuth()

  if (!user) {
    redirect("/login")
  }

  const tabs = [
    {
      value: "/profile",
      label: "General",
      href: "/profile",
    },
    ...(can(Permissions.READ_METADATA)
      ? [
          {
            value: "/profile/metadata",
            label: "My Metadata",
            href: "/profile/metadata",
          },
        ]
      : []),
    {
      value: "/profile/settings",
      label: "Settings",
      href: "/profile/settings",
    },
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and view your metadata
        </p>
      </div>

      <Card className="p-6">
        <Tabs value={pathname || ""} className="space-y-6">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="min-w-[100px]"
                asChild
              >
                <a href={tab.href}>{tab.label}</a>
              </TabsTrigger>
            ))}
          </TabsList>
          {children}
        </Tabs>
      </Card>
    </div>
  )
}
