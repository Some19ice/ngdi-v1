import { SuspenseSearchParams } from "@/components/wrappers/suspense-search-params"
import { SignInContent } from "./signin-content"

export default function SignInPage() {
  return (
    <SuspenseSearchParams>
      <SignInContent />
    </SuspenseSearchParams>
  )
}
