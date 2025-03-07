import { type Metadata } from "next"
import { type ReactNode } from "react"
import { AuthHandler } from "@/components/auth-components/auth-handler"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication pages for the application",
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <AuthHandler />
      <div className="w-full max-w-md space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to continue
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
