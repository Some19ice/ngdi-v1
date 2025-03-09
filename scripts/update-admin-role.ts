import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function updateAdminRole() {
  try {
    // Find the admin user by email
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    })

    if (!adminUser) {
      console.log("Admin user not found. Please check the email address.")
      return
    }

    console.log("Current user details:", {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    })

    // Update the user's role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: "admin@example.com" },
      data: {
        role: "ADMIN",
      },
    })

    console.log("Admin user role updated successfully!")
    console.log("Updated user details:", {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    })
  } catch (error) {
    console.error("Error updating admin user role:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
updateAdminRole()
