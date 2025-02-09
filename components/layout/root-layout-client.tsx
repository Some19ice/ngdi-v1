"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { SessionProvider } from "@/components/session-provider"
import { useState } from "react"

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex min-h-screen">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onCollapsedChange={setIsSidebarCollapsed}
          />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 px-8 py-6">{children}</main>
            <Footer />
          </div>
        </div>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  )
}
