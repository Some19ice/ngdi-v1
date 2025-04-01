"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

// Define the onboarding steps
export enum OnboardingStep {
  WELCOME = "welcome",
  DASHBOARD_TOUR = "dashboard_tour",
  METADATA_INTRO = "metadata_intro",
  SEARCH_INTRO = "search_intro",
  MAP_INTRO = "map_intro",
  COMPLETE = "complete",
}

// Define the onboarding state
export interface OnboardingState {
  isFirstVisit: boolean
  completedSteps: OnboardingStep[]
  currentStep: OnboardingStep | null
  isTourActive: boolean
  tourPaused: boolean
  showWelcomeModal: boolean
}

// Define the context type
interface OnboardingContextType {
  onboardingState: OnboardingState
  startOnboarding: () => void
  skipOnboarding: () => void
  completeStep: (step: OnboardingStep) => void
  startTour: () => void
  pauseTour: () => void
  resumeTour: () => void
  endTour: () => void
  setCurrentStep: (step: OnboardingStep | null) => void
  toggleWelcomeModal: (show: boolean) => void
  isStepCompleted: (step: OnboardingStep) => boolean
}

// Default context state
const defaultOnboardingState: OnboardingState = {
  isFirstVisit: true,
  completedSteps: [],
  currentStep: null,
  isTourActive: false,
  tourPaused: false,
  showWelcomeModal: false,
}

// Create the context
const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
)

// Provider component
export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, user } = useAuthSession()
  const userId = user?.id

  // Use local storage to persist state for anonymous and logged-in users
  const storageKey = userId ? `onboarding_${userId}` : "onboarding_anonymous"
  const [persistedState, setPersistedState] = useLocalStorage<OnboardingState>(
    storageKey,
    defaultOnboardingState
  )

  // Local state that syncs with storage
  const [onboardingState, setOnboardingState] =
    useState<OnboardingState>(persistedState)

  // Update state in storage when it changes
  useEffect(() => {
    setPersistedState(onboardingState)
  }, [onboardingState, setPersistedState])

  // Update storage key when user logs in
  useEffect(() => {
    if (userId && persistedState) {
      setOnboardingState(persistedState)
    }
  }, [userId, persistedState])

  // Start the onboarding process
  const startOnboarding = () => {
    setOnboardingState((prev) => ({
      ...prev,
      isFirstVisit: false,
      currentStep: OnboardingStep.WELCOME,
      showWelcomeModal: true,
    }))
  }

  // Skip the entire onboarding
  const skipOnboarding = () => {
    setOnboardingState((prev) => ({
      ...prev,
      isFirstVisit: false,
      completedSteps: Object.values(OnboardingStep),
      currentStep: null,
      isTourActive: false,
      tourPaused: false,
      showWelcomeModal: false,
    }))
  }

  // Mark a step as completed
  const completeStep = (step: OnboardingStep) => {
    setOnboardingState((prev) => {
      // Only add the step if it's not already completed
      if (prev.completedSteps.includes(step)) {
        return prev
      }

      const nextSteps = { ...prev }
      nextSteps.completedSteps = [...prev.completedSteps, step]

      // Determine the next step to show
      const allSteps = Object.values(OnboardingStep)
      const stepIndex = allSteps.indexOf(step)
      const nextStepIndex = stepIndex + 1

      // If there's a next step, set it as current
      if (nextStepIndex < allSteps.length - 1) {
        // Skip COMPLETE as it's a state, not a step
        if (allSteps[nextStepIndex] !== OnboardingStep.COMPLETE) {
          nextSteps.currentStep = allSteps[nextStepIndex]
        } else {
          nextSteps.currentStep = null
        }
      } else {
        // If we've completed all steps
        nextSteps.currentStep = null
      }

      return nextSteps
    })
  }

  // Start the feature tour
  const startTour = () => {
    setOnboardingState((prev) => ({
      ...prev,
      isTourActive: true,
      tourPaused: false,
      showWelcomeModal: false,
      currentStep: OnboardingStep.DASHBOARD_TOUR,
    }))
  }

  // Pause the tour
  const pauseTour = () => {
    setOnboardingState((prev) => ({
      ...prev,
      tourPaused: true,
    }))
  }

  // Resume the tour
  const resumeTour = () => {
    setOnboardingState((prev) => ({
      ...prev,
      tourPaused: false,
    }))
  }

  // End the tour
  const endTour = () => {
    setOnboardingState((prev) => ({
      ...prev,
      isTourActive: false,
      tourPaused: false,
      // Don't change currentStep as we might want to resume later
    }))
  }

  // Set the current step directly
  const setCurrentStep = (step: OnboardingStep | null) => {
    setOnboardingState((prev) => ({
      ...prev,
      currentStep: step,
    }))
  }

  // Toggle welcome modal visibility
  const toggleWelcomeModal = (show: boolean) => {
    setOnboardingState((prev) => ({
      ...prev,
      showWelcomeModal: show,
    }))
  }

  // Check if a step is completed
  const isStepCompleted = (step: OnboardingStep) => {
    return onboardingState.completedSteps.includes(step)
  }

  // Expose the context value
  const contextValue: OnboardingContextType = {
    onboardingState,
    startOnboarding,
    skipOnboarding,
    completeStep,
    startTour,
    pauseTour,
    resumeTour,
    endTour,
    setCurrentStep,
    toggleWelcomeModal,
    isStepCompleted,
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  )
}

// Custom hook for accessing the onboarding context
export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
