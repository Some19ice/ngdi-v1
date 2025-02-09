"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MapIcon, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession, signOut } from "next-auth/react"
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
import { UserRole } from "@prisma/client"

// Public navigation items
const publicNavItems = [
  { name: "Home", href: "/" },
  { name: "About NGDI", href: "/about" },
  { name: "NGDI Committee", href: "/committee" },
  { name: "Publications", href: "/publications" },
]

// Role-based navigation items
const roleBasedNavItems = {
  [UserRole.ADMIN]: [
    { name: "Add Metadata", href: "/metadata/add" },
    { name: "Admin Dashboard", href: "/admin" },
  ],
  [UserRole.MODERATOR]: [{ name: "Add Metadata", href: "/metadata/add" }],
  [UserRole.USER]: [],
}

// User menu items based on role
const getUserMenuItems = (role: UserRole) => {
  const items = [
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

  // Add role-specific menu items
  if ([UserRole.ADMIN, UserRole.MODERATOR].includes(role)) {
    items.push({
      name: "My Metadata",
      href: "/metadata",
      shortcut: "⌘M",
    })
  }

  return items
}

// Support menu items
const supportMenuItems = [
  { name: "Help", href: "/help" },
  { name: "Documentation", href: "/documentation" },
  { name: "Feedback", href: "/feedback" },
]

function UserAvatar({ user }: { user: any }) {
  return (
    <Avatar className="h-8 w-8 border border-border">
      <AvatarImage src={user.image || ""} alt={user.name || ""} />
      <AvatarFallback className="bg-primary/10">
        {user.name
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

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

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

  // Get navigation items based on user role
  const getNavItems = () => {
    const items = [...publicNavItems]
    if (session?.user?.role) {
      items.push(...(roleBasedNavItems[session.user.role] || []))
    }
    return items
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <UserAvatar user={session.user} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name}
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
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    disabled={isSigningOut}
                    onSelect={(event) => {
                      event.preventDefault()
                      handleSignOut()
                    }}
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        Sign out
                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}