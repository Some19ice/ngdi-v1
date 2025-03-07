"use client"

import { ReactNode } from "react"
import { AuthProvider as ClientAuthProvider } from "./auth-context"

export function AuthProvider({ children }: { children: ReactNode }) {
  return <ClientAuthProvider>{children}</ClientAuthProvider>
}
