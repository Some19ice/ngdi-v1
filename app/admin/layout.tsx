import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_PATHS } from "@/lib/auth/paths"
import { AdminNav } from "./components/admin-nav"

async function getUser() {
  const headersList = headers()
  return {
    id: headersList.get("x-user-id"),
    email: headersList.get("x-user-email"),
    role: headersList.get("x-user-role"),
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user.id || !user.role) {
    redirect(AUTH_PATHS.SIGNIN)
  }

  if (user.role !== "ADMIN") {
    redirect(AUTH_PATHS.UNAUTHORIZED)
  }

  return (
    <div className="container mx-auto py-8">
      <AdminNav user={user} />
      <main className="mt-8">{children}</main>
    </div>
  )
}
