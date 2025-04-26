"use client"

import React, { useEffect } from "react"
import {
  useOnboarding,
  OnboardingStep,
} from "@/components/providers/onboarding-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CheckCircle,
  AlertCircle,
  Search,
  MapPin,
  Database,
  HelpCircle,
  ChevronRight,
} from "lucide-react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { UserRole } from "@/lib/auth/constants"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface GetStartedAction {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
  completedStep?: OnboardingStep
  roleRequired?: UserRole[]
}

export function GettingStartedCard() {
  const { onboardingState, startTour, isStepCompleted } = useOnboarding()
  const { session, user } = useAuthSession()
  const userRole = session?.user?.role || UserRole.USER

  // Define the getting started actions
  const getStartedActions: GetStartedAction[] = [
    {
      id: "tour",
      title: "Take the platform tour",
      description: "Get familiar with the interface and main features",
      href: "#",
      icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
      completedStep: OnboardingStep.DASHBOARD_TOUR,
    },
    {
      id: "search",
      title: "Search for datasets",
      description: "Discover available geospatial data",
      href: "/search",
      icon: <Search className="h-5 w-5 text-indigo-500" />,
      completedStep: OnboardingStep.SEARCH_INTRO,
    },
    {
      id: "map",
      title: "Explore the map",
      description: "Visualize data on interactive maps",
      href: "/map",
      icon: <MapPin className="h-5 w-5 text-red-500" />,
      completedStep: OnboardingStep.MAP_INTRO,
    },
    {
      id: "metadata",
      title: "Create metadata",
      description: "Add your own dataset metadata",
      href: "/metadata/add",
      icon: <Database className="h-5 w-5 text-yellow-500" />,
      completedStep: OnboardingStep.METADATA_INTRO,
      roleRequired: [UserRole.ADMIN, UserRole.NODE_OFFICER],
    },
    {
      id: "help",
      title: "View documentation",
      description: "Learn more about the platform",
      href: "/documentation",
      icon: <HelpCircle className="h-5 w-5 text-purple-500" />,
    },
  ]

  // Filter actions by user role
  const filteredActions = getStartedActions.filter(
    (action) =>
      !action.roleRequired || action.roleRequired.includes(userRole as UserRole)
  )

  // Calculate completion progress
  const completedCount = filteredActions.filter(
    (action) => !action.completedStep || isStepCompleted(action.completedStep)
  ).length

  const progressPercentage = Math.round(
    (completedCount / filteredActions.length) * 100
  )

  // Handle tour action click
  const handleTourClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTour()
  }

  // If all onboarding steps are completed, don't show the card
  if (
    onboardingState.completedSteps.length >=
    Object.values(OnboardingStep).length - 1
  ) {
    return null
  }

  return (
    <Card className="w-full border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          Getting Started
          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
            {completedCount}/{filteredActions.length}
          </span>
        </CardTitle>
        <CardDescription>
          Complete these actions to get familiar with the NGDI Portal
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <Progress value={progressPercentage} className="h-2 mb-4" />

        <div className="space-y-3">
          {filteredActions.map((action) => {
            const isCompleted =
              !action.completedStep || isStepCompleted(action.completedStep)

            return (
              <div
                key={action.id}
                className={`flex items-start p-2 rounded-md ${
                  isCompleted
                    ? "bg-gray-50"
                    : "bg-white hover:bg-gray-50 transition-colors"
                }`}
              >
                <div className="mr-3 mt-0.5">{action.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{action.title}</h3>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <div className="ml-2 flex items-center">
                  {action.id === "tour" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleTourClick}
                      className={`text-sm ${isCompleted ? "opacity-50" : ""}`}
                      disabled={isCompleted}
                    >
                      {isCompleted ? "Completed" : "Start"}
                      {!isCompleted && (
                        <ChevronRight className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className={`text-sm ${isCompleted ? "opacity-50" : ""}`}
                      disabled={isCompleted}
                    >
                      <Link href={action.href}>
                        {isCompleted ? "Completed" : "Open"}
                        {!isCompleted && (
                          <ChevronRight className="ml-1 h-4 w-4" />
                        )}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="link" size="sm" asChild className="text-sm">
          <Link href="/documentation/getting-started">
            View detailed getting started guide
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ClientGettingStartedCard() {
  return <GettingStartedCard />
}
