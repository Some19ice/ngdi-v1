import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'
import { AUTH_CONFIG } from "./auth/config"

/**
 * Create a Supabase client for server-side use
 * @param cookieStore Cookie store from Next.js
 * @returns Supabase client
 */
export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Enhance cookie security
          const secureOptions = {
            ...options,
            // Use 'strict' for better security (prevents CSRF)
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          }
          cookieStore.set({ name, value, ...secureOptions })
        },
        remove(name: string, options: any) {
          const secureOptions = {
            ...options,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
          }
          cookieStore.set({ name, value: "", ...secureOptions })
        },
      },
    }
  )
}
