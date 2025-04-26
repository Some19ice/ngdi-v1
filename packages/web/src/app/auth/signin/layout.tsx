import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In - NGDI Portal",
  description: "Sign in to your NGDI Portal account",
}

// This is a server component
export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // We're inheriting from the parent auth layout
  // No need to add any additional layout structure
  return children
}
