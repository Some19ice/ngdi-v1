"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MapIcon, Loader2, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth/auth-context"
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
import { UserRole } from "@/lib/auth/types"
import { toast } from "sonner"

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
const getUserMenuItems = (role: UserRole | undefined) => {
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

  // Add role-specific menu items only if role is defined and is elevated
  if (role && elevatedRoles.includes(role)) {
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

interface UserWithMetadata {
  id: string
  email?: string
  user_metadata: {
    name?: string
    role?: UserRole
    avatar_url?: string
  }
}

function UserAvatar({ user }: { user: UserWithMetadata }) {
  return (
    <Avatar className="h-8 w-8 border border-border">
      <AvatarImage
        src={user.user_metadata.avatar_url || ""}
        alt={user.user_metadata.name || ""}
      />
      <AvatarFallback className="bg-primary/10">
        {user.user_metadata.name
          ?.split(" ")
          .map((n: string) => n[0])
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
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const userWithMetadata = user as UserWithMetadata | null

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    } finally {
      setIsSigningOut(false)
    }
  }

  const getNavItems = () => {
    const items = [...publicNavItems]
    const userRole = userWithMetadata?.user_metadata?.role
    if (userRole && Object.values(UserRole).includes(userRole)) {
      items.push(...(roleBasedNavItems[userRole] || []))
    }
    return items
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
            {userWithMetadata ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                    data-testid="user-menu"
                  >
                    <UserAvatar user={userWithMetadata} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userWithMetadata.user_metadata.name ||
                          userWithMetadata.email?.split("@")[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userWithMetadata.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {getUserMenuItems(userWithMetadata.user_metadata.role).map(
                      (item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href}>{item.name}</Link>
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault()
                      handleSignOut()
                    }}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Signing out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}