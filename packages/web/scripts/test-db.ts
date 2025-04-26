import { PrismaClient } from "@prisma/client"

async function main() {
  console.log("Testing database connection...")

  const prisma = new PrismaClient()

  try {
    // Test connection by querying the database
    const userCount = await prisma.user.count()
    console.log(
      `Connection successful! Found ${userCount} users in the database.`
    )

    // Get some basic stats about the database
    const metadataCount = await prisma.metadata.count()
    console.log(`Found ${metadataCount} metadata entries in the database.`)

    console.log("Database connection test completed successfully.")
  } catch (error) {
    console.error("Error connecting to the database:")
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
