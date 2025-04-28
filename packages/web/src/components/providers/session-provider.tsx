"use client"

import { AuthProvider } from "@/lib/supabase-auth-context"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
