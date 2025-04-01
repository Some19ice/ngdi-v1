"use client"

import React, { useEffect } from "react"
import { useOnboarding } from "@/components/providers/onboarding-provider"
import { WelcomeModal } from "./welcome-modal"
import { FeatureTour } from "./feature-tour"
import { usePathname } from "next/navigation"

export function OnboardingInitializer() {
  const { onboardingState, startOnboarding } = useOnboarding()
  const pathname = usePathname()

  // Check if user is on a page where we shouldn't show onboarding
  const isOnboardingDisabledPage =
    pathname?.startsWith("/auth/") ||
    pathname?.includes("error") ||
    pathname?.includes("loading") ||
    pathname === "/unauthorized"

  // Initialize onboarding for first-time visitors
  useEffect(() => {
    // Wait a bit to ensure the page is fully loaded
    if (onboardingState.isFirstVisit && !isOnboardingDisabledPage) {
      const timer = setTimeout(() => {
        startOnboarding()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [onboardingState.isFirstVisit, startOnboarding, isOnboardingDisabledPage])

  if (isOnboardingDisabledPage) {
    return null
  }

  return (
    <>
      <WelcomeModal />
      <FeatureTour />
    </>
  )
}
