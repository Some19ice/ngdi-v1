"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/lib/auth/auth-context"
import { Toaster } from "sonner"
import { Toaster as UIToaster } from "@/components/ui/toaster"
import { type User } from "@supabase/supabase-js"
import { type Session } from "next-auth"

interface RootProviderProps {
  children: React.ReactNode
  session?: Session | null
  initialUser?: User | null
}

export function RootProvider({
  children,
  session,
  initialUser,
}: RootProviderProps) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <AuthProvider initialUser={initialUser}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <UIToaster />
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
