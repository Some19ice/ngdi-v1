import { prisma } from "../shared/prisma-client"
import { supabaseAdmin } from "../lib/supabase-admin"
import { logger } from "../lib/logger"

// Log Supabase configuration
console.log(
  "Supabase URL:",
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"
)
console.log(
  "Supabase Service Role Key:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set (hidden)" : "Not set"
)

/**
 * Sync users from Prisma to Supabase
 * This script creates or updates users in Supabase based on the users in the Prisma database
 */
async function main() {
  console.log("Starting to sync users from Prisma to Supabase...")

  try {
    // Get all users from Prisma
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users in Prisma database.`)

    // Process each user
    for (const user of users) {
      console.log(`Processing user: ${user.email}`)

      try {
        // Check if user exists in Supabase
        const { data: existingUsers, error: getUserError } =
          await supabaseAdmin.auth.admin.listUsers()

        if (getUserError) {
          console.error(
            `Error checking if user exists in Supabase: ${getUserError.message}`
          )
          continue
        }

        // Find user by email
        const existingUser = existingUsers?.users?.find(
          (u) => u.email === user.email
        )

        if (existingUser) {
          console.log(
            `User ${user.email} already exists in Supabase. Updating metadata...`
          )

          // Update user metadata
          const { error: updateError } =
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              user_metadata: {
                name: user.name,
                role: user.role,
                organization: user.organization,
                department: user.department,
                phone: user.phone,
              },
            })

          if (updateError) {
            console.error(
              `Error updating user metadata in Supabase: ${updateError.message}`
            )
          } else {
            console.log(`Updated metadata for user ${user.email} in Supabase.`)
          }
        } else {
          console.log(
            `User ${user.email} does not exist in Supabase. Creating...`
          )

          // Create user in Supabase
          const { data: newUser, error: createError } =
            await supabaseAdmin.auth.admin.createUser({
              email: user.email,
              password: "TemporaryPassword123!", // Temporary password
              email_confirm: true, // Auto-confirm email
              user_metadata: {
                name: user.name,
                role: user.role,
                organization: user.organization,
                department: user.department,
                phone: user.phone,
              },
            })

          if (createError) {
            console.error(
              `Error creating user in Supabase: ${createError.message}`
            )
          } else {
            console.log(
              `Created user ${user.email} in Supabase with ID: ${newUser?.user?.id}`
            )
          }
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error)
      }
    }

    console.log("User sync completed successfully.")
  } catch (error) {
    console.error("Error during user sync:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log("User sync completed."))
  .catch((e) => {
    console.error("Error during user sync:", e)
    process.exit(1)
  })
