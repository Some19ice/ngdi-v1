import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), ".env")
console.log("Loading environment variables from:", envPath)
if (fs.existsSync(envPath)) {
  console.log("Found .env file")
  dotenv.config({ path: envPath })
} else {
  console.log(".env file not found")
  dotenv.config()
}

// Hardcoded values for testing
const supabaseUrl = "https://srbuueyoxonxzrswbzdu.supabase.co"
const supabaseServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYnV1ZXlveG9ueHpyc3diemR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTAxNDQ3MiwiZXhwIjoyMDU0NTkwNDcyfQ.Rl_GNnQH9H0u_tRmYZtY_6nNQkWfK2fYJMC9_gNp1Vc"

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Missing Supabase configuration. Please check your environment variables."
  )
  console.log("SUPABASE_URL:", supabaseUrl ? "Set" : "Not set")
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceRoleKey ? "Set" : "Not set"
  )
  process.exit(1)
}

// Create Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Test user credentials
const testEmail = "admin@ngdi.gov.ng"
const testPassword = "Admin123!@#"
const testName = "Administrator"
const testRole = "ADMIN"

async function createUser() {
  console.log(`Creating/updating user ${testEmail} in Supabase...`)

  try {
    // Check if user exists
    const { data: existingUsers, error: getUserError } =
      await supabaseAdmin.auth.admin.listUsers()

    if (getUserError) {
      console.error(
        `Error checking if user exists in Supabase: ${getUserError.message}`
      )
      return
    }

    // Find user by email
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === testEmail
    )

    if (existingUser) {
      console.log(
        `User ${testEmail} already exists in Supabase. Updating password...`
      )

      // Update user password
      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: testPassword,
          email_confirm: true,
          user_metadata: {
            name: testName,
            role: testRole,
          },
        })

      if (updateError) {
        console.error(`Error updating user in Supabase: ${updateError.message}`)
      } else {
        console.log(`Updated user ${testEmail} in Supabase.`)
      }
    } else {
      console.log(`User ${testEmail} does not exist in Supabase. Creating...`)

      // Create user in Supabase
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true,
          user_metadata: {
            name: testName,
            role: testRole,
          },
        })

      if (createError) {
        console.error(`Error creating user in Supabase: ${createError.message}`)
      } else {
        console.log(
          `Created user ${testEmail} in Supabase with ID: ${newUser?.user?.id}`
        )
      }
    }

    console.log("\nTest credentials for login:")
    console.log("Email:", testEmail)
    console.log("Password:", testPassword)
  } catch (error) {
    console.error("Error:", error)
  }
}

createUser()
