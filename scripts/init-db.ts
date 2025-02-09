import bcryptjs from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"
    const hashedPassword = await bcryptjs.hash(adminPassword, 10)

    const admin = await prisma.user.upsert({
      where: { email: "admin@ngdi.gov.ng" },
      update: {},
      create: {
        email: "admin@ngdi.gov.ng",
        name: "NGDI Admin",
        password: hashedPassword,
        role: "ADMIN",
        organization: "NGDI",
        department: "Administration",
      },
    })

    console.log("Database initialized with admin user:", admin.email)

    // Add more initialization logic here if needed
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
