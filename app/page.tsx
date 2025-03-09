import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth_token")

  if (!authToken) {
    redirect("/auth/signin")
  }

  redirect("/metadata")
}
