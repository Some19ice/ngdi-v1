"use client"

import React, { useEffect } from "react"
import {
  useOnboarding,
  OnboardingStep,
} from "@/components/providers/onboarding-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserRole } from "@/lib/auth/constants"
import { useAuthSession } from "@/hooks/use-auth-session"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, MapPin, Search, Database, Users } from "lucide-react"

export function WelcomeModal() {
  const {
    onboardingState,
    toggleWelcomeModal,
    startTour,
    skipOnboarding,
    completeStep,
  } = useOnboarding()
  const { session, user } = useAuthSession()
  const userRole = session?.user?.role || UserRole.USER
  const open = onboardingState.showWelcomeModal

  // Mark welcome step as completed when modal is opened
  useEffect(() => {
    if (open) {
      completeStep(OnboardingStep.WELCOME)
    }
  }, [open, completeStep])

  // Close the modal
  const handleClose = () => {
    toggleWelcomeModal(false)
  }

  // Skip the onboarding process
  const handleSkip = () => {
    skipOnboarding()
    handleClose()
  }

  // Start the feature tour
  const handleStartTour = () => {
    startTour()
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={toggleWelcomeModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Welcome to NGDI Portal
          </DialogTitle>
          <DialogDescription className="text-base">
            Your gateway to Nigeria&apos;s geospatial data infrastructure
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Key Features</TabsTrigger>
            <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="py-4">
            <div className="space-y-4">
              <p>
                The National Geospatial Data Infrastructure (NGDI) Portal is a
                centralized platform for managing, discovering, and accessing
                Nigeria&apos;s geospatial data resources.
              </p>
              <p>
                As a{" "}
                <span className="font-medium">
                  {userRole === UserRole.ADMIN
                    ? "Platform Administrator"
                    : userRole === UserRole.NODE_OFFICER
                      ? "Node Officer"
                      : "Portal User"}
                </span>
                , you&apos;ll have access to tools for{" "}
                {renderRoleSpecificOverview(userRole)}.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="features" className="py-4">
            <div className="space-y-4">
              <FeatureItem
                icon={<MapPin className="h-5 w-5 text-ngdi-green-500" />}
                title="Interactive Maps"
                description="Visualize geospatial data through our interactive mapping tools"
              />
              <FeatureItem
                icon={<Search className="h-5 w-5 text-ngdi-green-500" />}
                title="Advanced Search"
                description="Find the data you need with powerful filtering options"
              />
              <FeatureItem
                icon={<Database className="h-5 w-5 text-ngdi-green-500" />}
                title="Metadata Management"
                description="Create, edit, and manage metadata for geospatial datasets"
              />
              {userRole === UserRole.ADMIN && (
                <FeatureItem
                  icon={<Users className="h-5 w-5 text-ngdi-green-500" />}
                  title="User Administration"
                  description="Manage users, roles, and access permissions"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="next-steps" className="py-4">
            <div className="space-y-4">
              <p>To get started, we recommend:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Take the guided tour to familiarize yourself with the
                  interface
                </li>
                <li>
                  Explore the metadata catalog to discover available datasets
                </li>
                <li>Customize your profile settings</li>
                <li>Check out the documentation for detailed guidance</li>
              </ol>
              <p className="mt-4 italic">
                Take a moment to explore the platform, and don&apos;t hesitate
                to reach out if you have any questions!
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleSkip} className="mr-2">
              Skip Tour
            </Button>
          </div>
          <Button onClick={handleStartTour} className="ml-auto">
            Take the Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to render role-specific overview text
function renderRoleSpecificOverview(role: string) {
  switch (role) {
    case UserRole.ADMIN:
      return "managing users, overseeing metadata, and administering the platform"
    case UserRole.NODE_OFFICER:
      return "creating and managing metadata, uploading data, and collaborating with other nodes"
    default:
      return "searching, accessing, and visualizing geospatial data"
  }
}

// Feature item component for the feature tab
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start">
      <div className="mr-3 mt-1">{icon}</div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
