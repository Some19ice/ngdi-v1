import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fixSessionRoles() {
  try {
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    })

    if (!adminUser) {
      console.log("Admin user not found")
      return
    }

    console.log("Found admin user:", {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    })

    // Find all sessions for this user
    const sessions = await prisma.session.findMany({
      where: { userId: adminUser.id },
    })

    console.log(`Found ${sessions.length} sessions for admin user`)

    // Delete all sessions for this user to force re-login
    if (sessions.length > 0) {
      await prisma.session.deleteMany({
        where: { userId: adminUser.id },
      })
      console.log("Deleted all sessions for admin user")
    }

    console.log(
      "Session fix complete. Please log in again with your admin credentials."
    )
  } catch (error) {
    console.error("Error fixing sessions:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
fixSessionRoles()
