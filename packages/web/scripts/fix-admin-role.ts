import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fixAdminRole() {
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

    // Now let's check if there's a session for this user
    const sessions = await prisma.session.findMany({
      where: { userId: adminUser.id },
    })

    console.log(`Found ${sessions.length} sessions for this user.`)

    if (sessions.length > 0) {
      console.log(
        "You may need to sign out and sign back in for the changes to take effect."
      )
    }
  } catch (error) {
    console.error("Error updating admin user role:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
fixAdminRole()
