"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  MapIcon,
  Loader2,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  HelpCircle,
  FileText,
  MessageSquare,
  Moon,
  Sun,
  LayoutDashboard,
  Compass,
  BookOpen,
  Info,
  Users,
  Newspaper,
  FilePlus,
  LayoutGrid,
  Library,
  ChevronDown,
} from "lucide-react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { UserRole } from "@/lib/auth/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { HelpButton } from "@/components/ui/help-button"
import { ScrollArea } from "@/components/ui/scroll-area"

// Add global declaration for the session refresh timestamp
declare global {
  interface Window {
    __lastSessionRefresh: number
  }
}

// Type for navigation items
type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<any>
}

// Public navigation items
const publicNavItems: NavItem[] = [
  { name: "About NGDI", href: "/about", icon: Info },
  { name: "NGDI Committee", href: "/committee", icon: Users },
  { name: "Publications", href: "/publications", icon: Newspaper },
]

// Authenticated user navigation items - rearranged by importance and logical grouping
const authNavItems: NavItem[] = [
  { name: "Map", href: "/map", icon: MapIcon },
  { name: "Search", href: "/search", icon: Compass },
]

// Role-based navigation items - rearranged by priority
const roleBasedNavItems: Record<UserRole, NavItem[]> = {
  [UserRole.ADMIN]: [
    { name: "Admin Dashboard", href: "/admin", icon: LayoutGrid },
    { name: "Add Metadata", href: "/metadata/add", icon: FilePlus },
  ],
  [UserRole.NODE_OFFICER]: [
    { name: "My Metadata", href: "/my-metadata", icon: Library },
    { name: "Add Metadata", href: "/metadata/add", icon: FilePlus },
  ],
  [UserRole.USER]: [],
}

// Define elevated roles array
const elevatedRoles: UserRole[] = [UserRole.ADMIN, UserRole.NODE_OFFICER]

// User menu items based on role
const getUserMenuItems = (role: string | undefined) => {
  const baseItems = [
    {
      name: "Profile",
      href: "/profile",
      shortcut: "⇧⌘P",
      icon: User,
    },
    {
      name: "Settings",
      href: "/settings",
      shortcut: "⌘S",
      icon: Settings,
    },
  ]

  // Add role-specific menu items based on role string
  if (role === "admin" || role === "node_officer") {
    baseItems.push({
      name: "My Metadata",
      href: "/my-metadata",
      shortcut: "⌘M",
      icon: MapIcon,
    })
  }

  return baseItems
}

// Support menu items - rearranged by frequency of use
const supportMenuItems = [
  { name: "Documentation", href: "/documentation", icon: FileText },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
]

function UserAvatar({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null }
}) {
  return (
    <Avatar className="h-8 w-8 border border-border">
      <AvatarImage src={user.image || ""} alt={user.name || ""} />
      <AvatarFallback className="bg-primary/10">
        {user.name
          ? user.name
              .split(" ")
              .map((n) => n?.[0] || "")
              .join("")
              .toUpperCase()
          : "U"}
      </AvatarFallback>
    </Avatar>
  )
}

function LoadingHeader() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  )
}

function NavLink({
  href,
  className,
  active,
  children,
  onClick,
}: {
  href: string
  className?: string
  active: boolean
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors",
        active
          ? "text-white border-b-2 border-white"
          : "text-white/80 hover:text-white hover:border-b-2 hover:border-white/70",
        className
      )}
    >
      {children}
    </Link>
  )
}

// Mobile link component for sidebar navigation
interface MobileLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onOpenChange?: (open: boolean) => void
}

function MobileLink({
  href,
  children,
  className,
  onOpenChange,
}: MobileLinkProps) {
  const router = useRouter()

  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href)
        onOpenChange?.(false)
      }}
      className={className}
    >
      {children}
    </Link>
  )
}

// Helper function to get mobile links with icons
function getMobileNavLinks(
  items: NavItem[],
  pathname: string | null,
  onOpenChange: (open: boolean) => void
) {
  return items.map((item) => (
    <MobileLink
      key={item.href}
      href={item.href}
      onOpenChange={onOpenChange}
      className={cn(
        "flex items-center text-foreground/70 transition-colors hover:text-foreground",
        pathname === item.href && "text-foreground"
      )}
    >
      <item.icon className="mr-2 h-4 w-4" />
      {item.name}
    </MobileLink>
  ))
}

// Mobile navigation component with conditional rendering based on authentication
function MobileNavigation({ session }: { session: any }) {
  const pathname = usePathname()
  const onOpenChange = function noRefCheck() {}
  const { isAdmin, isNodeOfficer } = useAuthSession()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={onOpenChange}
        >
          <Image
            src="/logo.png"
            width={40}
            height={24}
            alt="NGDI Portal"
            className="mr-2"
          />
          <span className="font-bold">NGDI Portal</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {/* Public nav items - always visible */}
            <div className="mb-2">
              <h4 className="text-sm font-medium mb-1">Public Resources</h4>
              {getMobileNavLinks(publicNavItems, pathname, onOpenChange)}
            </div>

            {/* Authenticated nav items - only when logged in */}
            {session && (
              <>
                <div className="mt-4 mb-2 border-t pt-4">
                  <h4 className="text-sm font-medium mb-1">Portal Features</h4>
                  {getMobileNavLinks(authNavItems, pathname, onOpenChange)}
                </div>

                {/* Role-specific items */}
                {(isAdmin || isNodeOfficer) && (
                  <div className="mt-4 mb-2">
                    <h4 className="text-sm font-medium mb-1">Management</h4>
                    {getMobileNavLinks(
                      isAdmin
                        ? roleBasedNavItems[UserRole.ADMIN]
                        : roleBasedNavItems[UserRole.NODE_OFFICER],
                      pathname,
                      onOpenChange
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// Group navigation items by category
const groupNavItems = (session: any) => {
  const { isAdmin, isNodeOfficer } = session || {}
  const userRole = session?.user?.role?.toUpperCase()

  const groups = [
    {
      name: "Public",
      items: publicNavItems,
      visible: true,
    },
    {
      name: "Portal",
      items: authNavItems,
      visible: !!session,
    },
    {
      name: "Management",
      items:
        userRole === UserRole.ADMIN
          ? roleBasedNavItems[UserRole.ADMIN]
          : userRole === UserRole.NODE_OFFICER
            ? roleBasedNavItems[UserRole.NODE_OFFICER]
            : [],
      visible: !!(isAdmin || isNodeOfficer),
    },
  ]

  return groups.filter((group) => group.visible && group.items.length > 0)
}

export function Header({ children }: { children?: React.ReactNode }) {
  const {
    session,
    status,
    logout,
    refreshSession,
    isLoading,
    hasRole,
    isAdmin,
    isNodeOfficer,
    navigate,
  } = useAuthSession()
  const pathname = usePathname()

  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const hasRefreshed = useRef(false)

  // Add useEffect to ensure session is refreshed when the component mounts,
  // but prevent refreshing too frequently
  useEffect(() => {
    // Use a global refresh tracker to prevent multiple components triggering refreshes
    if (typeof window !== "undefined") {
      window.__lastSessionRefresh = window.__lastSessionRefresh || 0
    }

    const refreshUserSession = async () => {
      // Only refresh if enough time has passed since the last refresh (at least 30 seconds)
      const now = Date.now()
      if (
        !hasRefreshed.current &&
        (typeof window === "undefined" ||
          now - window.__lastSessionRefresh > 30000)
      ) {
        console.log("Header: Refreshing session")
        if (typeof window !== "undefined") {
          window.__lastSessionRefresh = now
        }
        await refreshSession()
        hasRefreshed.current = true
        console.log("Header: Session refreshed")
      } else if (!hasRefreshed.current) {
        console.log("Header: Skipping refresh - too soon since last refresh")
        hasRefreshed.current = true
      }
    }

    // Only attempt to refresh if we're not already authenticated
    if (status !== "authenticated") {
      refreshUserSession()
    } else {
      hasRefreshed.current = true
    }
  }, [refreshSession, status])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out. Please try again.")
    } finally {
      setIsSigningOut(false)
      setShowSignOutConfirm(false)
    }
  }

  if (status === "loading") {
    return <LoadingHeader />
  }

  return (
    <>
      {/* Logo Banner */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Image
                  src="/images/logo.png"
                  alt="NGDI Logo"
                  width={150}
                  height={50}
                  className="h-auto w-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#2a843c] text-white header-navigation">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center">
              {children}
              <Link
                href="/"
                className="flex items-center space-x-1 text-white mr-2"
              >
                <MapIcon className="h-5 w-5" />
                <span className="text-base font-bold">NGDI</span>
              </Link>

              {/* Desktop Navigation */}
              <nav
                className="ml-0 hidden lg:flex overflow-visible"
                aria-label="Main navigation"
              >
                {/* Responsive navigation system */}
                {/* Dropdown menus for medium screens */}
                <div className="hidden lg:flex 2xl:hidden space-x-1">
                  {groupNavItems({
                    user: session?.user,
                    isAdmin,
                    isNodeOfficer,
                  }).map((group, index) => (
                    <DropdownMenu key={index}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-9 px-2 text-sm whitespace-nowrap"
                        >
                          {group.name}
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {group.items.map((item) => (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="w-full">
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>

                {/* Full items for large screens */}
                <div className="hidden 2xl:flex items-center gap-1">
                  {/* Public navigation for all users */}
                  {publicNavItems.map((item) => (
                    <Button
                      key={item.href}
                      variant={pathname === item.href ? "default" : "ghost"}
                      className={cn(
                        "h-8 px-2 text-sm whitespace-nowrap",
                        pathname === item.href
                          ? "bg-primary text-white hover:bg-primary/90"
                          : ""
                      )}
                      asChild
                    >
                      <Link href={item.href}>
                        <item.icon
                          className="mr-1 h-4 w-4"
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </Button>
                  ))}

                  {/* Authenticated navigation only for logged in users */}
                  {session && (
                    <>
                      {authNavItems.map((item) => (
                        <Button
                          key={item.href}
                          variant={pathname === item.href ? "default" : "ghost"}
                          className={cn(
                            "h-8 px-2 text-sm whitespace-nowrap",
                            pathname === item.href
                              ? "bg-primary text-white hover:bg-primary/90"
                              : ""
                          )}
                          asChild
                        >
                          <Link href={item.href}>
                            <item.icon
                              className="mr-1 h-4 w-4"
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </Button>
                      ))}

                      {/* Role-based navigation for admin/node officers */}
                      {(isAdmin || isNodeOfficer) && (
                        <>
                          {(isAdmin
                            ? roleBasedNavItems[UserRole.ADMIN]
                            : roleBasedNavItems[UserRole.NODE_OFFICER]
                          ).map((item) => (
                            <Button
                              key={item.href}
                              variant={
                                pathname === item.href ? "default" : "ghost"
                              }
                              className={cn(
                                "h-8 px-2 text-sm whitespace-nowrap",
                                pathname === item.href
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : ""
                              )}
                              asChild
                            >
                              <Link href={item.href}>
                                <item.icon
                                  className="mr-1 h-4 w-4"
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </Button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Navigation */}
              <MobileNavigation session={session} />

              {/* User Menu (Desktop) */}
              {session?.user ? (
                <div className="hidden lg:block">
                  <div className="flex items-center gap-1">
                    <HelpButton />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative h-8 w-8 rounded-full hover:bg-green-700"
                          data-testid="user-menu"
                        >
                          <UserAvatar user={session.user} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                      >
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {session.user.name ||
                                session.user.email?.split("@")[0]}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {session.user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          {getUserMenuItems(session.user.role).map((item) => (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link
                                href={item.href}
                                className="flex w-full items-center"
                              >
                                {item.icon && (
                                  <item.icon className="mr-2 h-4 w-4" />
                                )}
                                {item.name}
                                {item.shortcut && (
                                  <DropdownMenuShortcut>
                                    {item.shortcut}
                                  </DropdownMenuShortcut>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          {supportMenuItems.map((item) => (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link
                                href={item.href}
                                className="flex w-full items-center"
                              >
                                {item.icon && (
                                  <item.icon className="mr-2 h-4 w-4" />
                                )}
                                {item.name}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />

                        <AlertDialog
                          open={showSignOutConfirm}
                          onOpenChange={setShowSignOutConfirm}
                        >
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                setShowSignOutConfirm(true)
                              }}
                            >
                              {isSigningOut ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <LogOut className="mr-2 h-4 w-4" />
                              )}
                              <span>Sign out</span>
                              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                            </DropdownMenuItem>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden lg:inline-flex text-white hover:bg-green-700 border border-white/40"
                >
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}