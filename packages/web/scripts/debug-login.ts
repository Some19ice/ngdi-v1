import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function debugLogin() {
  try {
    // Check test user
    const testUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    })

    console.log("Test User:", testUser ? {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      role: testUser.role,
      passwordLength: testUser.password?.length || 0
    } : "Not found")

    if (testUser) {
      // Test password validation
      const testPassword = "password123"
      const isValidPassword = await bcrypt.compare(testPassword, testUser.password)
      console.log("Test password valid:", isValidPassword)
      
      // If password is invalid, update it
      if (!isValidPassword) {
        const hashedPassword = await bcrypt.hash(testPassword, 10)
        const updatedUser = await prisma.user.update({
          where: { email: "test@example.com" },
          data: { password: hashedPassword },
        })
        console.log("Updated test user password")
      }
    }

    // Check admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    })

    console.log("Admin User:", adminUser ? {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      passwordLength: adminUser.password?.length || 0
    } : "Not found")

    if (adminUser) {
      // Test password validation
      const adminPassword = "admin123"
      const isValidPassword = await bcrypt.compare(adminPassword, adminUser.password)
      console.log("Admin password valid:", isValidPassword)
      
      // If password is invalid, update it
      if (!isValidPassword) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10)
        const updatedUser = await prisma.user.update({
          where: { email: "admin@example.com" },
          data: { password: hashedPassword },
        })
        console.log("Updated admin user password")
      }
    }
  } catch (error) {
    console.error("Error debugging login:", error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLogin() 