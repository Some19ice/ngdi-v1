import { prisma } from "../shared/prisma-client"
import { hash } from "bcryptjs"
import { UserRole } from "@prisma/client"

async function main() {
  console.log("Starting to seed users...")

  try {
    // Create admin user
    const adminExists = await prisma.user.findUnique({
      where: { email: "admin@ngdi.gov.ng" },
    })

    if (!adminExists) {
      const hashedAdminPassword = await hash("Admin123!@#", 10)
      await prisma.user.create({
        data: {
          email: "admin@ngdi.gov.ng",
          password: hashedAdminPassword,
          name: "Administrator",
          role: UserRole.ADMIN,
          organization: "NGDI",
          department: "Administration",
          phone: "+234800000000",
        },
      })
      console.log("Admin user created successfully.")
    } else {
      // Update admin password if user already exists
      const hashedAdminPassword = await hash("Admin123!@#", 10)
      await prisma.user.update({
        where: { email: "admin@ngdi.gov.ng" },
        data: { password: hashedAdminPassword },
      })
      console.log("Admin user password updated successfully.")
    }

    // Create test user
    const testUserExists = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    })

    if (!testUserExists) {
      const hashedTestPassword = await hash("password123", 10)
      await prisma.user.create({
        data: {
          email: "test@example.com",
          password: hashedTestPassword,
          name: "Test User",
          role: UserRole.USER,
          organization: "Test Organization",
          department: "Testing",
          phone: "+234800000001",
        },
      })
      console.log("Test user created successfully.")
    } else {
      console.log("Test user already exists.")
    }

    // Create node officer
    const nodeOfficerExists = await prisma.user.findUnique({
      where: { email: "nodeofficer@ngdi.gov.ng" },
    })

    if (!nodeOfficerExists) {
      const hashedPassword = await hash("officer123", 10)
      await prisma.user.create({
        data: {
          email: "nodeofficer@ngdi.gov.ng",
          password: hashedPassword,
          name: "Node Officer",
          role: UserRole.NODE_OFFICER,
          organization: "NGDI",
          department: "Operations",
          phone: "+234800000002",
        },
      })
      console.log("Node officer created successfully.")
    } else {
      console.log("Node officer already exists.")
    }

    console.log("Seeding completed successfully.")
  } catch (error) {
    console.error("Error during seeding:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log("Seeding completed."))
  .catch((e) => {
    console.error("Error during seeding:", e)
    process.exit(1)
  })
