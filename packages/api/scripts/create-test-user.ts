import { prisma } from "../src/lib/prisma"
import { hashPassword } from "../src/utils/password"
import { UserRole } from "@prisma/client"

async function createTestUser() {
  try {
    console.log("Creating test user...")

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    })

    if (existingUser) {
      console.log("Test user already exists, updating password...")
      await prisma.user.update({
        where: { email: "test@example.com" },
        data: {
          password: await hashPassword("password123"),
        },
      })
      console.log("Password updated successfully")
    } else {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          password: await hashPassword("password123"),
          name: "Test User",
          role: UserRole.ADMIN,
          emailVerified: new Date(),
        },
      })
      console.log("Test user created successfully:", user.email)
    }

    // Also create/update admin user
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@ngdi.gov.ng" },
    })

    if (existingAdmin) {
      console.log("Admin user already exists, updating password...")
      await prisma.user.update({
        where: { email: "admin@ngdi.gov.ng" },
        data: {
          password: await hashPassword("Admin123!@#"),
        },
      })
      console.log("Admin password updated successfully")
    } else {
      // Create admin user
      const admin = await prisma.user.create({
        data: {
          email: "admin@ngdi.gov.ng",
          password: await hashPassword("Admin123!@#"),
          name: "Admin User",
          role: UserRole.ADMIN,
          emailVerified: new Date(),
        },
      })
      console.log("Admin user created successfully:", admin.email)
    }

    console.log("Done!")
  } catch (error) {
    console.error("Error creating test users:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
