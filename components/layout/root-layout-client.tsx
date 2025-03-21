"use client"

import { Header } from "@/components/layout/header"
import { Banner } from "@/components/layout/banner"
import Footer from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSession, useAuth } from "@/lib/auth-context"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// Sidebar loading fallback component
const SidebarSkeleton = ({
  isCollapsed = false,
}: {
  isCollapsed?: boolean
}) => (
  <div
    className={cn(
      "hidden lg:block h-full",
      isCollapsed ? "w-[60px]" : "w-[240px]"
    )}
  >
    <Skeleton className="h-full w-full" />
  </div>
)

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const { refreshSession } = useAuth()
  const hasRefreshed = useRef(false)

  // Refresh session only once when the component mounts
  useEffect(() => {
    const initSession = async () => {
      if (!hasRefreshed.current && status === "loading") {
        await refreshSession()
        hasRefreshed.current = true
      }
    }

    initSession()
  }, [refreshSession, status])

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobileMenuOpen])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [children])

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <Suspense fallback={<SidebarSkeleton isCollapsed={isSidebarCollapsed} />}>
        <div className="hidden lg:block">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onCollapsedChange={setIsSidebarCollapsed}
          />
        </div>
      </Suspense>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isMobile
          isOpen={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
          isCollapsed={false}
          onCollapsedChange={() => {}}
        />

        {/* Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <Banner />
        <Header>
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden text-white hover:bg-green-700"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Toggle sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </Header>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
