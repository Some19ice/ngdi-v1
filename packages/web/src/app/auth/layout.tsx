import { AuthPageWrapper } from "@/components/wrappers/auth-page-wrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication pages for the NGDI Portal",
}

// Import the config to ensure it's applied to all auth pages
import "./config"

// Force dynamic rendering for all auth pages
export const dynamic = "force-dynamic"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AuthPageWrapper>{children}</AuthPageWrapper>
    </div>
  )
}
