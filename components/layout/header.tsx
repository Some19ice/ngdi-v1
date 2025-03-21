"use client"

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
} from "lucide-react"
import { useSession, useAuth } from "@/lib/auth-context"
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
import { ThemeToggle } from "@/components/theme-toggle"

// Public navigation items
const publicNavItems = [
  { name: "About NGDI", href: "/about" },
  { name: "NGDI Committee", href: "/committee" },
  { name: "Publications", href: "/publications" },
]

// Role-based navigation items
const roleBasedNavItems: Record<
  UserRole,
  Array<{ name: string; href: string }>
> = {
  [UserRole.ADMIN]: [
    { name: "Add Metadata", href: "/metadata/add" },
    { name: "Admin Dashboard", href: "/admin" },
  ],
  [UserRole.NODE_OFFICER]: [
    { name: "Add Metadata", href: "/metadata/add" },
    { name: "My Metadata", href: "/my-metadata" },
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

// Support menu items
const supportMenuItems = [
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Documentation", href: "/documentation", icon: FileText },
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
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "U"}
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

export function Header({ children }: { children?: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { logout, refreshSession } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const hasRefreshed = useRef(false)

  // Add useEffect to ensure session is refreshed when the component mounts
  useEffect(() => {
    const refreshUserSession = async () => {
      // Only refresh if we haven't refreshed before
      if (!hasRefreshed.current) {
        console.log("Header: Refreshing session")
        await refreshSession()
        hasRefreshed.current = true
        console.log("Header: Session refreshed")
      }
    }

    refreshUserSession()
  }, [refreshSession])

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

  const getNavItems = () => {
    const items = [...publicNavItems]
    const userRole = session?.user?.role?.toUpperCase()

    if (userRole === UserRole.ADMIN) {
      items.push(...(roleBasedNavItems[UserRole.ADMIN] || []))
    } else if (userRole === UserRole.NODE_OFFICER) {
      items.push(...(roleBasedNavItems[UserRole.NODE_OFFICER] || []))
    } else if (userRole === UserRole.USER) {
      items.push(...(roleBasedNavItems[UserRole.USER] || []))
    }

    return items
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
      <header className="sticky top-0 z-50 w-full bg-[#2a843c] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center">
              {children}
              <Link href="/" className="flex items-center space-x-2 text-white">
                <MapIcon className="h-5 w-5" />
                <span className="text-base font-bold">NGDI Portal</span>
              </Link>

              {/* Desktop Navigation */}
              <nav
                className="ml-10 hidden space-x-6 lg:flex"
                aria-label="Main navigation"
              >
                {getNavItems().map((link) => (
                  <NavLink
                    key={link.name}
                    href={link.href}
                    active={pathname === link.href}
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Mobile Navigation */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Menu"
                    className="text-white hover:bg-green-700"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                      <MapIcon className="h-5 w-5 text-[#2a843c]" />
                      <span>NGDI Portal</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-3 py-4">
                    {getNavItems().map((link) => (
                      <SheetClose asChild key={link.name}>
                        <NavLink
                          href={link.href}
                          active={pathname === link.href}
                          className={cn(
                            "flex py-2",
                            pathname === link.href
                              ? "text-[#2a843c] border-none font-medium"
                              : "text-gray-700 hover:text-[#2a843c] border-none"
                          )}
                        >
                          {link.name}
                        </NavLink>
                      </SheetClose>
                    ))}

                    {/* Mobile-only user links */}
                    {session?.user && (
                      <>
                        <div className="my-2 h-px bg-border" />
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          Your Account
                        </p>
                        {getUserMenuItems(session.user.role).map((item) => (
                          <SheetClose asChild key={item.name}>
                            <NavLink
                              href={item.href}
                              active={pathname === item.href}
                              className={cn(
                                "flex items-center gap-2 py-2",
                                pathname === item.href
                                  ? "text-[#2a843c] border-none font-medium"
                                  : "text-gray-700 hover:text-[#2a843c] border-none"
                              )}
                            >
                              {item.icon && <item.icon className="h-4 w-4" />}
                              {item.name}
                            </NavLink>
                          </SheetClose>
                        ))}

                        <div className="my-2 h-px bg-border" />
                        <div className="flex items-center px-2 py-2">
                          <ThemeToggle variant="minimal" />
                          <span className="ml-2 text-sm">Toggle theme</span>
                        </div>

                        <AlertDialog
                          open={showSignOutConfirm}
                          onOpenChange={setShowSignOutConfirm}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="mt-2"
                              onClick={(e) => {
                                e.preventDefault()
                                setShowSignOutConfirm(true)
                              }}
                            >
                              {isSigningOut ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <LogOut className="mr-2 h-4 w-4" />
                              )}
                              Sign out
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
                                Sign out
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}

                    {/* Sign in button for mobile if not logged in */}
                    {!session?.user && (
                      <SheetClose asChild>
                        <Button
                          asChild
                          variant="default"
                          className="mt-4 bg-[#2a843c] text-white hover:bg-[#236e32]"
                        >
                          <Link href="/auth/signin">Sign in</Link>
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* User Menu (Desktop) */}
              {session?.user ? (
                <div className="hidden lg:block">
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

                      {/* Theme Toggle */}
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <div className="flex w-full items-center">
                          <ThemeToggle variant="minimal" />
                          <span className="ml-2">Toggle theme</span>
                        </div>
                      </DropdownMenuItem>
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