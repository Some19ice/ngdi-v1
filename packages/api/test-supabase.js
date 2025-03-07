const { createClient } = require("@supabase/supabase-js")
require("dotenv").config()

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log("Supabase URL:", supabaseUrl ? "Found" : "Not found")
console.log("Supabase Key:", supabaseKey ? "Found" : "Not found")

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Supabase credentials are missing. Please check your .env file."
  )
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...")

    // Try to get the current user to test the connection
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error connecting to Supabase:", error.message)
      return false
    }

    console.log("Successfully connected to Supabase!")
    console.log("Session data:", data)
    return true
  } catch (error) {
    console.error("Exception when connecting to Supabase:", error.message)
    return false
  }
}

// Run the test
testSupabaseConnection()
  .then((success) => {
    if (!success) {
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error("Unexpected error:", error)
    process.exit(1)
  })
