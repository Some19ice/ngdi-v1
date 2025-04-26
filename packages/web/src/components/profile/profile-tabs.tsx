"use client"

import { ReactNode } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface ProfileTabsProps {
  children: ReactNode
}

export function ProfileTabs({ children }: ProfileTabsProps) {
  const pathname = usePathname() || "/profile"

  // Helper function to determine the active tab
  const getActiveTab = (path: string) => {
    if (path === "/profile") return "/profile"
    if (path.startsWith("/profile/edit")) return "/profile/edit"
    if (path.startsWith("/profile/settings")) return "/profile/settings"
    return "/profile"
  }

  const activeTab = getActiveTab(pathname)

  const tabs = [
    {
      value: "/profile",
      label: "General",
      href: "/profile",
    },
    {
      value: "/profile/edit",
      label: "Edit Profile",
      href: "/profile/edit",
    },
    {
      value: "/profile/settings",
      label: "Settings",
      href: "/profile/settings",
    },
  ]

  return (
    <Tabs value={activeTab} className="space-y-6">
      <TabsList className="w-full justify-start border-b pb-px">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="min-w-[100px] data-[state=active]:border-b-2 data-[state=active]:border-primary"
            asChild
          >
            <Link href={tab.href}>{tab.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="pt-4">{children}</div>
    </Tabs>
  )
}
