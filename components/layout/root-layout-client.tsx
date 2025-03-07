"use client"

import { Header } from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { useState } from "react"
import { AuthHandler } from "@/components/auth-components/auth-handler"

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <>
      <AuthHandler />
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
    </>
  )
}
