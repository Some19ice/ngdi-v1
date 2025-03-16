import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"
import { UsersTable } from "./components/users-table"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function UsersPage() {
  // Server-side authentication check
  const user = await requireAuth()

  // Check if user is admin
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized: Admin access required")
  }

  // Fetch initial users data server-side
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: true,
      department: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  })

  // Get total count for pagination
  const total = await prisma.user.count()

  // Get auth token to pass to client for subsequent requests
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth_token")?.value || ""

  return (
    <UsersTable
      initialUsers={users}
      initialTotal={total}
      authToken={authToken}
    />
  )
}
