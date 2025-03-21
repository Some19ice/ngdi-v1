import { SuspenseSearchParams } from "@/components/wrappers/suspense-search-params"
import { SignInContent } from "./signin-content"
import { redirectIfAuthenticated } from "@/lib/auth"
import { cookies } from "next/headers"

export default async function SignInPage() {
  try {
    // Redirect if already authenticated
    await redirectIfAuthenticated()
  } catch (error) {
    console.error("Error in redirectIfAuthenticated:", error)
    // Continue rendering the page if there's an error with redirect
  }

  return (
    <SuspenseSearchParams>
      <SignInContent />
    </SuspenseSearchParams>
  )
}
