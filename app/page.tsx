import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function HomePage() {
  // Check if user is authenticated
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth_token")

  // If not authenticated, redirect to sign-in
  if (!authToken) {
    redirect("/auth/signin")
  }

  // If authenticated, redirect to metadata page
  redirect("/metadata")
}
