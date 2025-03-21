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
  LayoutDashboard,
  Compass,
  BookOpen,
  Moon,
  Sun,
} from "lucide-react"
import { Permission, Permissions } from "@/lib/auth/types"
import { UserRole } from "@/lib/auth/constants"
import { LucideIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  permission: Permission
}

interface NavSection {
  title?: string
  items: NavItem[]
}

interface SidebarProps {
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  isMobile?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const getMainNavItems = (role?: string): NavSection[] => {
  // Core navigation items
  const coreItems: NavItem[] = [
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
  ]

  // Content navigation items
  const contentItems: NavItem[] = [
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
  ]

  // About navigation items
  const aboutItems: NavItem[] = [
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
      icon: BookOpen,
      permission: Permissions.READ_METADATA,
    },
  ]

  const adminItems: NavItem[] = []

  // Add role-specific items
  if (role === UserRole.ADMIN || role === UserRole.NODE_OFFICER) {
    adminItems.push({
      title: "Add Metadata",
      href: "/metadata/add",
      icon: PlusCircle,
      badge: "New",
      permission: Permissions.CREATE_METADATA,
    })
  }

  if (role === UserRole.ADMIN) {
    adminItems.push({
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
      permission: Permissions.VIEW_ANALYTICS,
    })
    adminItems.push({
      title: "Organizations",
      href: "/admin/organizations",
      icon: Building2,
      permission: Permissions.MANAGE_ORGANIZATION,
    })
  }

  // Create sections
  const sections: NavSection[] = [
    { title: "Main", items: coreItems },
    { title: "Content", items: contentItems },
    { title: "Information", items: aboutItems },
  ]

  // Only add admin section if there are admin items
  if (adminItems.length > 0) {
    sections.push({ title: "Admin", items: adminItems })
  }

  return sections
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
      href: "/my-metadata",
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

export function Sidebar({
  isCollapsed,
  onCollapsedChange,
  isMobile = false,
  isOpen = false,
  onOpenChange = () => {},
}: SidebarProps) {
  const { data: session, status } = useSession()
  const { logout, refreshSession } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [cachedNavSections, setCachedNavSections] = useState<NavSection[]>([])
  const [cachedUserNavItems, setCachedUserNavItems] = useState<NavItem[]>([])
  const [previouslyAuthenticated, setPreviouslyAuthenticated] = useState(false)
  const hasRefreshed = useRef(false)

  // Add useEffect to refresh the session on mount
  useEffect(() => {
    const refreshUserSession = async () => {
      if (!hasRefreshed.current) {
        console.log("Sidebar: Refreshing session")
        await refreshSession()
        hasRefreshed.current = true
        console.log("Sidebar: Session refreshed")
      }
    }

    refreshUserSession()
  }, [refreshSession])

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setPreviouslyAuthenticated(true)
      setCachedNavSections(getMainNavItems(session.user.role))
      setCachedUserNavItems(getUserNavItems(session.user.role))
    }
  }, [status, session])

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

  if (status === "loading" && !previouslyAuthenticated) {
    return (
      <div
        className={cn(
          "flex h-full flex-col border-r bg-background py-4 transition-all duration-300",
          isCollapsed && !isMobile ? "w-[60px] px-2" : "w-[240px] px-3",
          isMobile ? "fixed inset-y-0 left-0 z-50 shadow-lg transform" : "",
          isMobile && !isOpen ? "-translate-x-full" : "",
          isMobile && isOpen ? "translate-x-0" : "",
          "items-center justify-center"
        )}
      >
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === "unauthenticated" && !previouslyAuthenticated) {
    return null
  }

  const navSections =
    status === "authenticated" && session?.user
      ? getMainNavItems(session.user.role)
      : cachedNavSections

  const userNavItems =
    status === "authenticated" && session?.user
      ? getUserNavItems(session.user.role)
      : cachedUserNavItems

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex h-full flex-col border-r bg-background py-4 transition-all duration-300",
          isCollapsed && !isMobile ? "w-[60px] px-2" : "w-[240px] px-3",
          isMobile ? "fixed inset-y-0 left-0 z-50 shadow-lg transform" : "",
          isMobile && !isOpen ? "-translate-x-full" : "",
          isMobile && isOpen ? "translate-x-0" : ""
        )}
      >
        <div
          className={cn(
            "mb-4 flex items-center",
            isCollapsed ? "justify-center" : "gap-2 px-2"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ngdi-green-500/10">
            <Map className="h-5 w-5 text-ngdi-green-500" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold text-foreground">
              NGDI <span className="text-ngdi-green-500">Portal</span>
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin">
            {navSections.map((section, index) => (
              <div key={section.title || index} className="mb-2">
                {!isCollapsed && section.title && (
                  <div className="mb-2 px-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {section.title}
                    </p>
                    <Separator className="mt-1" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link key={item.href} href={item.href}>
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={isActive ? "default" : "ghost"}
                                className={cn(
                                  "w-full justify-start gap-2 relative",
                                  isActive &&
                                    "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-text))] hover:bg-[hsl(var(--sidebar-active))] hover:brightness-95 dark:bg-[hsl(var(--sidebar-active))] dark:text-[hsl(var(--sidebar-active-text))] font-medium shadow-sm border-[hsl(var(--sidebar-active))] dark:border-[hsl(var(--sidebar-active))] ring-offset-background transition-colors",
                                  !isActive &&
                                    "text-foreground hover:bg-ngdi-green-50 hover:text-ngdi-green-500 dark:text-muted-foreground dark:hover:text-white border-transparent",
                                  isCollapsed && isActive && "p-1.5 rounded-md",
                                  isCollapsed &&
                                    !isActive &&
                                    "px-2 flex justify-center items-center",
                                  !isCollapsed && "px-3"
                                )}
                                size="icon"
                              >
                                <div
                                  className={cn(
                                    isCollapsed &&
                                      isActive &&
                                      "p-1 rounded-full flex items-center justify-center"
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      isActive &&
                                        "text-[hsl(var(--sidebar-active-text))]",
                                      isCollapsed && "h-5 w-5"
                                    )}
                                  />
                                </div>
                                {isActive && isCollapsed && (
                                  <span className="absolute left-0 right-0 bottom-0 h-1 bg-[hsl(var(--sidebar-active-text))] rounded-sm" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.title}
                              {item.badge && (
                                <span className="ml-1 px-1 py-0.5 text-xs rounded-sm bg-primary/20 text-primary">
                                  {item.badge}
                                </span>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-2 relative",
                              isActive &&
                                "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-text))] hover:bg-[hsl(var(--sidebar-active))] hover:brightness-95 dark:bg-[hsl(var(--sidebar-active))] dark:text-[hsl(var(--sidebar-active-text))] font-medium shadow-sm border-[hsl(var(--sidebar-active))] dark:border-[hsl(var(--sidebar-active))] ring-offset-background transition-colors",
                              !isActive &&
                                "text-foreground hover:bg-ngdi-green-50 hover:text-ngdi-green-500 dark:text-muted-foreground dark:hover:text-white border-transparent",
                              !isCollapsed && "px-3"
                            )}
                            size="sm"
                          >
                            <div>
                              <Icon
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  isActive &&
                                    "text-[hsl(var(--sidebar-active-text))]"
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                "text-sm",
                                isActive && "font-medium"
                              )}
                            >
                              {item.title}
                            </span>
                            {item.badge && (
                              <Badge
                                variant="outline"
                                className="ml-auto text-xs h-5 bg-primary/10 text-primary border-primary/20"
                              >
                                {item.badge}
                              </Badge>
                            )}
                            {isActive && !isCollapsed && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4/5 bg-[hsl(var(--sidebar-active-text))] rounded-r-sm" />
                            )}
                          </Button>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-2">
            {!isCollapsed && (
              <div className="mb-2 px-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Account
                </p>
                <Separator className="mt-1" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              {userNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-2 relative",
                              isActive &&
                                "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-text))] hover:bg-[hsl(var(--sidebar-active))] hover:brightness-95 dark:bg-[hsl(var(--sidebar-active))] dark:text-[hsl(var(--sidebar-active-text))] font-medium shadow-sm border-[hsl(var(--sidebar-active))] dark:border-[hsl(var(--sidebar-active))] ring-offset-background transition-colors",
                              !isActive &&
                                "text-foreground hover:bg-ngdi-green-50 hover:text-ngdi-green-500 dark:text-muted-foreground dark:hover:text-white border-transparent",
                              isCollapsed && isActive && "p-1.5 rounded-md",
                              isCollapsed &&
                                !isActive &&
                                "px-2 flex justify-center items-center"
                            )}
                            size="icon"
                          >
                            <div
                              className={cn(
                                isCollapsed &&
                                  isActive &&
                                  "p-1 rounded-full flex items-center justify-center"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  isActive &&
                                    "text-[hsl(var(--sidebar-active-text))]",
                                  isCollapsed && "h-5 w-5"
                                )}
                              />
                            </div>
                            {isActive && isCollapsed && (
                              <span className="absolute left-0 right-0 bottom-0 h-1 bg-[hsl(var(--sidebar-active-text))] rounded-sm" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2 relative",
                          isActive &&
                            "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-text))] hover:bg-[hsl(var(--sidebar-active))] hover:brightness-95 dark:bg-[hsl(var(--sidebar-active))] dark:text-[hsl(var(--sidebar-active-text))] font-medium shadow-sm border-[hsl(var(--sidebar-active))] dark:border-[hsl(var(--sidebar-active))] ring-offset-background transition-colors",
                          !isActive &&
                            "text-foreground hover:bg-ngdi-green-50 hover:text-ngdi-green-500 dark:text-muted-foreground dark:hover:text-white border-transparent",
                          !isCollapsed && "px-3"
                        )}
                        size="sm"
                      >
                        <div>
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isActive &&
                                "text-[hsl(var(--sidebar-active-text))]"
                            )}
                          />
                        </div>
                        <span
                          className={cn("text-sm", isActive && "font-medium")}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge
                            variant="outline"
                            className="ml-auto text-xs h-5 bg-primary/10 text-primary border-primary/20"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4/5 bg-[hsl(var(--sidebar-active-text))] rounded-r-sm" />
                        )}
                      </Button>
                    )}
                  </Link>
                )
              })}

              {/* Theme Toggle */}
              {!isCollapsed && <ThemeToggle variant="sidebar" />}
              {isCollapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex justify-center items-center mx-auto"
                      onClick={() => {
                        const theme =
                          document.documentElement.classList.contains("dark")
                            ? "light"
                            : "dark"
                        document.documentElement.classList.toggle("dark")
                        localStorage.setItem("theme", theme)
                      }}
                      aria-label="Toggle theme"
                    >
                      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Toggle theme</TooltipContent>
                </Tooltip>
              )}

              <AlertDialog
                open={showSignOutConfirm}
                onOpenChange={setShowSignOutConfirm}
              >
                <AlertDialogTrigger asChild>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "w-full justify-center items-center hover:bg-destructive/10 hover:text-destructive text-muted-foreground",
                            isCollapsed ? "px-2" : "px-3"
                          )}
                          onClick={(e) => {
                            e.preventDefault()
                            setShowSignOutConfirm(true)
                          }}
                        >
                          {isSigningOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogOut className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Sign out</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive text-muted-foreground",
                        "px-3"
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        setShowSignOutConfirm(true)
                      }}
                    >
                      {isSigningOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      <span className="text-sm">Sign out</span>
                    </Button>
                  )}
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
            </div>
          </div>

          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto mt-2 hidden w-9 lg:flex"
              onClick={() => onCollapsedChange(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto mt-2 w-9 flex lg:hidden"
                onClick={() => onOpenChange(!isOpen)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
