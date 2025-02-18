import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { UserRole } from "@prisma/client"

async function globalSetup() {
  // Clean up the test database
  await prisma.user.deleteMany()

  // Create test admin user
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is required for tests")
  }

  await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@ngdi.gov.ng",
      name: "NGDI Admin",
      password: await hash(adminPassword, 12),
      role: UserRole.ADMIN,
      organization: "NGDI",
      department: "Administration",
      emailVerified: new Date(),
    },
  })

  await prisma.$disconnect()
}

export default globalSetup
