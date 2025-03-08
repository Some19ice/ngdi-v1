import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function createOrUpdateAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    })

    const hashedPassword = await bcrypt.hash("admin123", 10)

    if (existingUser) {
      console.log("Admin user exists, updating password...")
      
      // Update the user's password and role
      const updatedUser = await prisma.user.update({
        where: { email: "admin@example.com" },
        data: { 
          password: hashedPassword,
          role: "ADMIN"
        },
      })
      
      console.log("Admin user updated successfully:", updatedUser.email)
      console.log("Email: admin@example.com")
      console.log("Password: admin123")
      console.log("Role: ADMIN")
      return
    }

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    })

    console.log("Admin user created successfully:", user.email)
    console.log("Email: admin@example.com")
    console.log("Password: admin123")
    console.log("Role: ADMIN")
  } catch (error) {
    console.error("Error creating/updating admin user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createOrUpdateAdminUser() 