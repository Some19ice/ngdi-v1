import { PrismaClient } from "@prisma/client"
import { execSync } from "child_process"
import { join } from "path"

const TEST_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/ngdi_test?schema=public"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: TEST_DATABASE_URL,
    },
  },
})

export async function setupTestDatabase() {
  const prismaBinary = join("node_modules", ".bin", "prisma")

  try {
    // Push the schema to the database
    execSync(
      `${prismaBinary} db push --schema=./prisma/schema.test.prisma --force-reset`,
      {
        env: {
          ...process.env,
          DATABASE_URL: TEST_DATABASE_URL,
        },
      }
    )
  } catch (error) {
    console.error("Error setting up test database:", error)
    throw error
  }

  return prisma
}

export async function teardownTestDatabase() {
  await prisma.$disconnect()
}

export { prisma as testDb }
