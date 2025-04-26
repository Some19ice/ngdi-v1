import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { UserRole } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Hash the admin password
    const hashedPassword = await hash(process.env.ADMIN_PASSWORD!, 12)

    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: new Date(),
      },
      create: {
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        password: hashedPassword,
        role: UserRole.ADMIN,
        name: "Admin User",
        emailVerified: new Date(),
      },
    })

    console.log("Admin user created/updated:", admin.email)

    // Create a test user
    const testUser = await prisma.user.upsert({
      where: { email: "user@test.com" },
      update: {
        password: await hash("Test123!@#", 12),
        role: UserRole.USER,
        emailVerified: new Date(),
      },
      create: {
        email: "user@test.com",
        password: await hash("Test123!@#", 12),
        role: UserRole.USER,
        name: "Test User",
        emailVerified: new Date(),
      },
    })

    console.log("Test user created/updated:", testUser.email)
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
