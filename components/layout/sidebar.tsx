"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Permission, Permissions, UserRole } from "@/lib/auth/types"
import { LucideIcon } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  permission: Permission
}

interface SidebarProps {
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
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

export function Sidebar({ isCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { user, can } = useAuth({
    // TODO: Replace with actual user data
    user: {
      id: "1",
      email: "user@example.com",
      role: UserRole.ADMIN,
    },
  })

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({
        redirect: false,
        callbackUrl: "/",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!user) return null

  const mainNavItems = getMainNavItems(user.role)
  const userNavItems = getUserNavItems(user.role)

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background py-4 transition-all duration-300",
        isCollapsed ? "w-[60px] px-2" : "w-[240px] px-3"
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center",
          isCollapsed ? "justify-center" : "gap-2 px-2"
        )}
      >
        <Map className="h-6 w-6 shrink-0 text-ngdi-green-500" />
        {!isCollapsed && (
          <span className="text-lg font-semibold text-ngdi-green-500">
            NGDI Portal
          </span>
        )}
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
                      "hover:bg-ngdi-green-50 hover:text-ngdi-green-500",
                    isCollapsed && "px-2"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && item.title}
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
                      "hover:bg-ngdi-yellow-50 hover:text-ngdi-yellow-500",
                    isCollapsed && "px-2"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && item.title}
                </Button>
              </Link>
            )
          })}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive",
              isCollapsed && "px-2"
            )}
            onClick={handleSignOut}
            disabled={isSigningOut}
            title={isCollapsed ? "Sign out" : undefined}
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 shrink-0" />
            )}
            {!isCollapsed && (isSigningOut ? "Signing out..." : "Sign out")}
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="mt-4 self-end"
        onClick={() => onCollapsedChange(!isCollapsed)}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
