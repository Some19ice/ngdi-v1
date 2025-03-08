import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function createOrUpdateTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    })

    const hashedPassword = await bcrypt.hash("password123", 10)

    if (existingUser) {
      console.log("Test user exists, updating password...")
      
      // Update the user's password
      const updatedUser = await prisma.user.update({
        where: { email: "test@example.com" },
        data: { password: hashedPassword },
      })
      
      console.log("Test user password updated successfully:", updatedUser.email)
      console.log("Email: test@example.com")
      console.log("Password: password123")
      return
    }

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        password: hashedPassword,
        role: "USER",
      },
    })

    console.log("Test user created successfully:", user.email)
    console.log("Email: test@example.com")
    console.log("Password: password123")
  } catch (error) {
    console.error("Error creating/updating test user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createOrUpdateTestUser() 