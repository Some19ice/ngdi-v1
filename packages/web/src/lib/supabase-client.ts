import { createBrowserClient } from "@supabase/ssr"
import { Database } from "./database.types"
import { supabaseAuthConfig } from "./auth/supabase-auth.config"

/**
 * Create a Supabase client for browser-side use
 * @returns Supabase client
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // Use PKCE flow for better security (prevents CSRF attacks)
        flowType: "pkce",
        // Store tokens in cookies for better security
        cookies: {
          name: supabaseAuthConfig.cookies.prefix,
          lifetime: supabaseAuthConfig.cookies.maxAge,
          domain: supabaseAuthConfig.cookies.domain,
          // Use 'strict' for better security (prevents CSRF)
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          path: supabaseAuthConfig.cookies.path,
        },
      },
    }
  )
}
