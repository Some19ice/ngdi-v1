import { redirectIfAuthenticated } from "@/lib/auth"
import { SignUpForm } from "./signup-form"

export default async function SignUpPage() {
  // Redirect if already authenticated
  await redirectIfAuthenticated()

  return <SignUpForm />
}
