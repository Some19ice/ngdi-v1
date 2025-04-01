import { UserRole } from "@/lib/auth/constants"

export interface TourStep {
  target: string // CSS selector for the target element
  title: string
  content: string
  placement?: "top" | "right" | "bottom" | "left"
  disableBeacon?: boolean
  disableOverlayClose?: boolean
  spotlightClicks?: boolean
  roles?: UserRole[] // Optional array of roles that should see this step
}

// Base tour steps that all users see
export const baseTourSteps: TourStep[] = [
  {
    target: ".header-navigation",
    title: "Main Navigation",
    content: "Use the main menu to access different areas of the platform.",
    placement: "bottom",
    disableBeacon: true,
  },
  // Dashboard steps removed - will be rebuilt from scratch
]

// Admin-specific tour steps
export const adminTourSteps: TourStep[] = [
  {
    target: "[data-tour='metadata-stats']",
    title: "Metadata Management",
    content:
      "As an administrator, you can manage all metadata across the platform.",
    placement: "right",
    roles: [UserRole.ADMIN],
  },
]

// Node officer-specific tour steps
export const nodeOfficerTourSteps: TourStep[] = [
  {
    target: "[data-tour='metadata-stats']",
    title: "Metadata Management",
    content:
      "Create and manage metadata records for your organization's datasets.",
    placement: "top",
    roles: [UserRole.NODE_OFFICER, UserRole.ADMIN],
  },
]

// Function to get tour steps based on user role
export function getTourSteps(role?: UserRole): TourStep[] {
  const steps = [...baseTourSteps]

  if (role === UserRole.ADMIN) {
    steps.push(...adminTourSteps)
  }

  if (role === UserRole.NODE_OFFICER || role === UserRole.ADMIN) {
    steps.push(...nodeOfficerTourSteps)
  }

  // Sort steps to ensure they are in a logical order
  // This is just a simplified sorting - you might want to define a specific order
  return steps.sort((a, b) => {
    // Admin dashboard should come after base steps
    if (a.target.includes("admin-dashboard")) return 1
    if (b.target.includes("admin-dashboard")) return -1
    return 0
  })
}
