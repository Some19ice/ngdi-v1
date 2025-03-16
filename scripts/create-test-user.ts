import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: "test@example.com",
      },
    })

    if (existingUser) {
      console.log("Test user already exists with ID:", existingUser.id)
      return
    }

    // Create a test user
    const hashedPassword = await bcrypt.hash("password123", 10)

    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "ADMIN",
        organization: "Test Organization",
        department: "Test Department",
        phone: "+1234567890",
      },
    })

    console.log("Created test user with ID:", user.id)
  } catch (error) {
    console.error("Error creating test user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 