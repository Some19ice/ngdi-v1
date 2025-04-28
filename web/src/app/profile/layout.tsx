"use client"

import React from "react"
import { AppShell, Container } from "@mantine/core"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner"
import { PasswordExpirationBanner } from "@/components/auth/PasswordExpirationBanner"
import { useAuth } from "@/hooks/useAuth"
import { ProfileSidebar } from "@/components/profile/ProfileSidebar"

/**
 * Layout for the profile pages
 * Includes the email verification banner for users with unverified emails
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useAuth()

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm" }}
      padding="md"
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Navbar>
        <ProfileSidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container>
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
