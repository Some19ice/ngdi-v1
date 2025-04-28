import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "../config/supabase.config"
import { logger } from "./logger"

// Log Supabase configuration status
if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
  logger.warn(
    "Missing Supabase configuration. Using placeholder values in development mode.",
    {
      url: !!supabaseConfig.url,
      serviceRoleKey: !!supabaseConfig.serviceRoleKey,
      environment: process.env.NODE_ENV,
    }
  )

  // Only throw error in production
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing Supabase configuration. Please check your environment variables."
    )
  }
}

/**
 * Create a Supabase client with admin privileges for server-side operations
 * This client uses the service role key and should only be used server-side
 */
export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Create a Supabase client with anonymous privileges for server-side operations
 * This client uses the anonymous key and can be used for public operations
 */
export const supabaseAnon = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Utility function to check if Supabase is properly configured
 * @returns True if Supabase is properly configured, false otherwise
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Try to make a simple query to check if Supabase is accessible
    const { error } = await supabaseAdmin
      .from("_prisma_migrations")
      .select("id")
      .limit(1)

    if (error) {
      logger.error("Supabase connection check failed", {
        error: error.message,
        code: error.code,
      })
      return false
    }

    return true
  } catch (error) {
    logger.error("Supabase connection check failed with exception", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return false
  }
}
