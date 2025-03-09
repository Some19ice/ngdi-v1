"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MapIcon, Loader2, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
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
import { useState } from "react"
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
import { cn } from "@/lib/utils"

// Public navigation items
const publicNavItems = [
  { name: "Home", href: "/" },
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
    { name: "My Metadata", href: "/metadata" },
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
    },
    {
      name: "Settings",
      href: "/settings",
      shortcut: "⌘S",
    },
  ]

  // Add role-specific menu items based on role string
  if (role === "admin" || role === "node_officer") {
    baseItems.push({
      name: "My Metadata",
      href: "/metadata",
      shortcut: "⌘M",
    })
  }

  return baseItems
}

// Support menu items
const supportMenuItems = [
  { name: "Help", href: "/help" },
  { name: "Documentation", href: "/documentation" },
  { name: "Feedback", href: "/feedback" },
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

export function Header() {
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <MapIcon className="h-8 w-8" />
              <span className="text-xl font-bold">NGDI Portal</span>
            </Link>
            <div className="ml-10 hidden space-x-8 lg:block">
              {getNavItems().map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    data-testid="user-menu"
                  >
                    <UserAvatar user={session.user} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || session.user.email?.split("@")[0]}
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
                        <Link href={item.href}>
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
                        <Link href={item.href}>{item.name}</Link>
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
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}