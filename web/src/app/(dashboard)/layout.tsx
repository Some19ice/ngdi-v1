"use client"

import React from "react"
import { AppShell, Container } from "@mantine/core"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner"
import { PasswordExpirationBanner } from "@/components/auth/PasswordExpirationBanner"
import { useAuth } from "@/hooks/useAuth"

/**
 * Layout for the dashboard pages
 * Includes the email verification banner for users with unverified emails
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useAuth()

  return (
    <AppShell header={{ height: 60 }} footer={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          {!isLoading && (
            <>
              <EmailVerificationBanner />
              <PasswordExpirationBanner />
            </>
          )}
          {children}
        </Container>
      </AppShell.Main>

      <AppShell.Footer>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  )
}
