"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { OnboardingProvider } from "./onboarding-provider"

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <OnboardingProvider>
          {children}
          <Toaster />
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
