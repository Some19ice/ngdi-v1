import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { UserRole } from "@prisma/client"
import { getTestUser } from "../helpers/auth"

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

  // Create test user
  const testUser = getTestUser()
  await prisma.user.create({
    data: {
      email: testUser.email,
      name: testUser.name,
      password: await hash(testUser.password, 12),
      role: UserRole.USER,
      organization: testUser.organization,
      emailVerified: new Date(), // Pre-verify email for testing
    },
  })

  await prisma.$disconnect()
}

export default globalSetup
