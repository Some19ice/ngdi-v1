import { createClient } from "@supabase/supabase-js"
import { config } from "../config"

// Initialize Supabase client
const supabaseUrl = config.supabase?.url || process.env.SUPABASE_URL || ""
const supabaseKey =
  config.supabase?.anonKey || process.env.SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Supabase URL or anon key is missing. Please check your environment variables."
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
