"use client"

import { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth/auth-context"
import { Toaster } from "sonner"

interface ProvidersProps {
  children: ReactNode
  session: any
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider session={session}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
