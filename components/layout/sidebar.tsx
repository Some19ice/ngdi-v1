"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Info,
  Users,
  FileText,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Search,
  Map,
  BarChart,
  Building2,
  Image,
  Newspaper,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Permission, Permissions, UserRole } from "@/lib/auth/types"
import { LucideIcon } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  permission: Permission
}

const getMainNavItems = (role: UserRole): NavItem[] => {
  const items: NavItem[] = [
    {
      title: "Home",
      href: "/",
      icon: Home,
      permission: Permissions.READ_METADATA,
    },
    {
      title: "Search",
      href: "/search",
      icon: Search,
      permission: Permissions.READ_METADATA,
    },
    {
      title: "Map",
      href: "/map",
      icon: Map,
      permission: Permissions.READ_METADATA,
    },
    {
      title: "Gallery",
      href: "/gallery",
      icon: Image,
      permission: Permissions.READ_METADATA,
    },
    {
      title: "News",
      href: "/news",
      icon: Newspaper,
      permission: Permissions.READ_METADATA,
    },
    {
      title: "About NGDI",
      href: "/about",
      icon: Info,
      permission: Permissions.READ_METADATA,
    },
    {
      title: "NGDI Committee",
      href: "/committee",
      icon: Users,
      permission: Permissions.READ_METADATA,
    },
    {
      title: "Publications",
      href: "/publications",
      icon: FileText,
      permission: Permissions.READ_METADATA,
    },
  ]

  // Add role-specific items
  if (role === UserRole.ADMIN || role === UserRole.NODE_OFFICER) {
    items.push({
      title: "Add Metadata",
      href: "/metadata/add",
      icon: PlusCircle,
      permission: Permissions.CREATE_METADATA,
    })
  }

  if (role === UserRole.ADMIN) {
    items.push({
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
      permission: Permissions.VIEW_ANALYTICS,
    })
    items.push({
      title: "Organizations",
      href: "/admin/organizations",
      icon: Building2,
      permission: Permissions.MANAGE_ORGANIZATION,
    })
  }

  return items
}

const getUserNavItems = (role: UserRole): NavItem[] => {
  const items: NavItem[] = [
    {
      title: "My Profile",
      href: "/profile",
      icon: User,
      permission: Permissions.READ_USER,
    },
  ]

  if (role === UserRole.ADMIN || role === UserRole.NODE_OFFICER) {
    items.push({
      title: "My Metadata",
      href: "/profile/metadata",
      icon: FileText,
      permission: Permissions.READ_METADATA,
    })
  }

  items.push({
    title: "Settings",
    href: "/profile/settings",
    icon: Settings,
    permission: Permissions.READ_USER,
  })

  return items
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, can } = useAuth({
    // TODO: Replace with actual user data
    user: {
      id: "1",
      email: "user@example.com",
      role: UserRole.ADMIN,
    },
  })

  if (!user) return null

  const mainNavItems = getMainNavItems(user.role)
  const userNavItems = getUserNavItems(user.role)

  return (
    <div className="flex h-full w-[240px] flex-col border-r bg-background px-3 py-4">
      <div className="mb-4 flex items-center gap-2 px-2">
        <Map className="h-6 w-6 text-ngdi-green-500" />
        <span className="text-lg font-semibold text-ngdi-green-500">
          NGDI Portal
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            if (!can(item.permission)) return null

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive &&
                      "bg-ngdi-green-500 text-white hover:bg-ngdi-green-600",
                    !isActive &&
                      "hover:bg-ngdi-green-50 hover:text-ngdi-green-500"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="flex flex-col gap-2">
          {userNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            if (!can(item.permission)) return null

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive &&
                      "bg-ngdi-yellow-500 text-white hover:bg-ngdi-yellow-600",
                    !isActive &&
                      "hover:bg-ngdi-yellow-50 hover:text-ngdi-yellow-500"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
