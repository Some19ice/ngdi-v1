import { PrismaClient, UserRole } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  try {
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@ngdi.gov.ng"
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      throw new Error("ADMIN_PASSWORD environment variable is required")
    }

    const hashedPassword = await hash(adminPassword, 12)

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        emailVerified: new Date(),
      },
      create: {
        email: adminEmail,
        name: "NGDI Admin",
        password: hashedPassword,
        role: UserRole.ADMIN,
        organization: "NGDI",
        department: "Administration",
        emailVerified: new Date(), // Admin is pre-verified
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
