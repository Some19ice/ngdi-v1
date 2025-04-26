import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminMetadata() {
  try {
    // Get the admin user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "admin@example.com")
      .single()

    if (userError) {
      console.error("Error fetching admin user:", userError)
      return
    }

    if (!user) {
      console.log("Admin user not found")
      return
    }

    console.log("Current user:", user)
    console.log("Current metadata:", user.raw_user_meta_data)

    // Update the user metadata to include the correct role
    const { data: updatedUser, error: updateError } =
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.raw_user_meta_data,
          role: "ADMIN",
        },
      })

    if (updateError) {
      console.error("Error updating user metadata:", updateError)
      return
    }

    console.log("User metadata updated successfully!")
    console.log("Updated user:", updatedUser)
  } catch (error) {
    console.error("Error in fixAdminMetadata:", error)
  }
}

// Run the function
fixAdminMetadata()
