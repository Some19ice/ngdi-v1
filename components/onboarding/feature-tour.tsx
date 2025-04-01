"use client"

import React, { useEffect, useState } from "react"
import Joyride, { CallBackProps, Step } from "react-joyride"
import {
  useOnboarding,
  OnboardingStep,
} from "@/components/providers/onboarding-provider"
import { useAuthSession } from "@/hooks/use-auth-session"
import { UserRole } from "@/lib/auth/constants"
import { getTourSteps, TourStep } from "./tour-steps"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function FeatureTour() {
  const { onboardingState, endTour, pauseTour, completeStep, resumeTour } =
    useOnboarding()
  const { session, user } = useAuthSession()
  const userRole = session?.user?.role || UserRole.USER

  // Initialize steps based on user role
  const [steps, setSteps] = useState<Step[]>([])

  // Convert our TourStep format to react-joyride Step format
  useEffect(() => {
    const tourSteps = getTourSteps(userRole as UserRole)
    const joyrideSteps = tourSteps.map((step: TourStep) => ({
      target: step.target,
      content: (
        <div className="max-w-xs">
          <h3 className="text-lg font-medium mb-2">{step.title}</h3>
          <p className="text-muted-foreground">{step.content}</p>
        </div>
      ),
      placement: step.placement,
      disableBeacon: step.disableBeacon || false,
      disableOverlayClose: step.disableOverlayClose || false,
      spotlightClicks: step.spotlightClicks || false,
    }))

    setSteps(joyrideSteps)

    // Debug - log the steps
    console.log("Tour steps:", joyrideSteps)
  }, [userRole])

  // Debug - log onboarding state changes
  useEffect(() => {
    console.log("Onboarding state:", onboardingState)
  }, [onboardingState])

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data

    // Debug log
    console.log("Tour callback:", { action, index, status, type })

    // Handle tour completion or user skipping
    if (status === "finished" || status === "skipped") {
      completeStep(OnboardingStep.DASHBOARD_TOUR)
      endTour()
      return
    }

    // Handle tour being paused
    if (action === "close" || status === "paused") {
      pauseTour()
    }
  }

  // Debug - check if tour elements exist
  useEffect(() => {
    if (onboardingState.isTourActive && steps.length > 0) {
      // Check if tour targets exist in the DOM
      steps.forEach((step, index) => {
        const target = document.querySelector(step.target as string)
        console.log(
          `Tour step ${index} target: ${step.target} exists:`,
          !!target
        )
      })
    }
  }, [onboardingState.isTourActive, steps])

  // Define tour styling
  const tourStyles = {
    options: {
      arrowColor: "#ffffff",
      backgroundColor: "#ffffff",
      overlayColor: "rgba(0, 0, 0, 0.5)",
      primaryColor: "#10b981", // teal-500
      textColor: "#333333",
      zIndex: 10000,
    },
    tooltipContainer: {
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    buttonNext: {
      backgroundColor: "#10b981",
      color: "#ffffff",
      fontSize: "14px",
      padding: "8px 16px",
      fontWeight: 500,
    },
    buttonBack: {
      color: "#4b5563",
      fontSize: "14px",
      marginRight: "8px",
    },
    buttonSkip: {
      color: "#6b7280",
      fontSize: "14px",
    },
  }

  // Custom components
  const floatingButtonClasses =
    "fixed bottom-4 right-4 z-50 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-full p-3 shadow-md hover:bg-gray-50 transition-all"

  return (
    <>
      {/* Main tour component */}
      {onboardingState.isTourActive && steps.length > 0 && (
        <Joyride
          steps={steps}
          run={onboardingState.isTourActive && !onboardingState.tourPaused}
          continuous
          showProgress
          showSkipButton
          hideCloseButton={false}
          disableScrolling={false}
          styles={tourStyles}
          callback={handleJoyrideCallback}
          locale={{
            back: "Back",
            close: "Close",
            last: "Finish",
            next: "Next",
            skip: "Skip",
          }}
          // Debug props
          debug={true}
        />
      )}

      {/* Floating button to resume tour when paused */}
      {onboardingState.tourPaused && (
        <Button onClick={() => resumeTour()} className={floatingButtonClasses}>
          Resume Tour
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 ml-1 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              endTour()
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">End tour</span>
          </Button>
        </Button>
      )}
    </>
  )
}
