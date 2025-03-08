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
import { Permission, Permissions, UserRole } from "@/lib/auth/types"
import { LucideIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useSession, useAuth } from "@/lib/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

const getMainNavItems = (role?: string): NavItem[] => {
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

const getUserNavItems = (role?: string): NavItem[] => {
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
  const { data: session, status } = useSession()
  const { logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out. Please try again.")
    } finally {
      setIsSigningOut(false)
      setShowSignOutConfirm(false)
    }
  }

  if (status === "loading") {
    return null
  }

  if (!session?.user) {
    return null
  }

  const mainNavItems = getMainNavItems(session.user.role)
  const userNavItems = getUserNavItems(session.user.role)

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
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          {userNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

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
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}

          <AlertDialog
            open={showSignOutConfirm}
            onOpenChange={setShowSignOutConfirm}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive",
                  isCollapsed && "px-2"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  setShowSignOutConfirm(true)
                }}
              >
                {isSigningOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
                {!isCollapsed && <span>Sign out</span>}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out of your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSignOut}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isSigningOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  <span>Sign out</span>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden w-9 lg:flex"
            onClick={() => onCollapsedChange(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
