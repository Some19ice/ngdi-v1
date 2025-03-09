import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function checkAndFixAdminUsers() {
  try {
    console.log("Checking admin users...")

    // Check if any admin users exist
    const adminUsers = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
    })

    console.log(`Found ${adminUsers.length} admin users:`)
    adminUsers.forEach((user) => {
      console.log(
        `- ${user.email} (${user.name || "No name"}) - Role: ${user.role}`
      )
    })

    // Check if admin@example.com exists
    const defaultAdmin = await prisma.user.findUnique({
      where: {
        email: "admin@example.com",
      },
    })

    if (defaultAdmin) {
      console.log("\nDefault admin user exists:")
      console.log(`- ID: ${defaultAdmin.id}`)
      console.log(`- Email: ${defaultAdmin.email}`)
      console.log(`- Name: ${defaultAdmin.name || "No name"}`)
      console.log(`- Role: ${defaultAdmin.role}`)

      // Fix role if needed
      if (defaultAdmin.role !== "ADMIN") {
        console.log("\nFixing admin role...")
        await prisma.user.update({
          where: { id: defaultAdmin.id },
          data: { role: "ADMIN" },
        })
        console.log("Admin role fixed!")
      }
    } else {
      console.log("\nDefault admin user does not exist. Creating...")

      // Create default admin
      const hashedPassword = await bcrypt.hash("admin123", 10)

      const newAdmin = await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Admin User",
          password: hashedPassword,
          role: "ADMIN",
          organization: "NGDI Administration",
        },
      })

      console.log("Default admin user created:")
      console.log(`- ID: ${newAdmin.id}`)
      console.log(`- Email: ${newAdmin.email}`)
      console.log(`- Name: ${newAdmin.name}`)
      console.log(`- Role: ${newAdmin.role}`)
      console.log("\nYou can now log in with:")
      console.log("Email: admin@example.com")
      console.log("Password: admin123")
    }

    // Check for any users with invalid roles
    const allUsers = await prisma.user.findMany()
    const invalidRoleUsers = allUsers.filter(
      (user) => !["ADMIN", "NODE_OFFICER", "USER"].includes(user.role)
    )

    if (invalidRoleUsers.length > 0) {
      console.log("\nFound users with invalid roles:")
      for (const user of invalidRoleUsers) {
        console.log(`- ${user.email} (${user.role})`)

        // Fix to USER role
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "USER" },
        })

        console.log(`  Fixed role to USER`)
      }
    }

    console.log("\nAdmin user check complete!")
  } catch (error) {
    console.error("Error checking admin users:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
checkAndFixAdminUsers()
