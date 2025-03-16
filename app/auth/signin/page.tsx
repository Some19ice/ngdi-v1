import { SuspenseSearchParams } from "@/components/wrappers/suspense-search-params"
import { SignInContent } from "./signin-content"
import { redirectIfAuthenticated } from "@/lib/auth"

export default async function SignInPage() {
  // Redirect if already authenticated
  await redirectIfAuthenticated()

  return (
    <SuspenseSearchParams>
      <SignInContent />
    </SuspenseSearchParams>
  )
}
