import { SuspenseSearchParams } from "@/components/wrappers/suspense-search-params"
import { SignInContent } from "./signin-content"
import { getCurrentUser } from "@/lib/auth"
import { cookies } from "next/headers"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In - NGDI Portal",
  description: "Sign in to your NGDI Portal account",
}

export default async function SignInPage() {
  // Check auth status but don't redirect on the server
  // (we'll handle redirects client-side to avoid the redirect error)
  const user = await getCurrentUser()
  const initiallyAuthenticated = !!user

  return (
    <SuspenseSearchParams>
      <SignInContent initiallyAuthenticated={initiallyAuthenticated} />
    </SuspenseSearchParams>
  )
}
