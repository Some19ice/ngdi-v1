import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { Request, Response } from 'express'
import { logger } from './logger'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

// Log Supabase configuration status
if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('Missing Supabase configuration. Please check your environment variables.', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey,
    environment: process.env.NODE_ENV,
  })

  // Only throw error in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Supabase configuration. Please check your environment variables.')
  }
}

// Flag to track if Supabase is properly configured
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseUrl !== 'https://placeholder-project.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'placeholder-anon-key'
)

/**
 * Creates a Supabase client for server-side usage with cookie-based auth
 */
export function createServerSupabaseClient(req: Request, res: Response) {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get: (name) => {
          return req.cookies[name]
        },
        set: (name, value, options) => {
          const cookieOptions: CookieOptions = {
            ...options,
            sameSite: 'strict',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          }
          res.cookie(name, value, cookieOptions)
        },
        remove: (name, options) => {
          res.clearCookie(name, {
            ...options,
            sameSite: 'strict',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          })
        },
      },
    }
  )
}

/**
 * Creates a Supabase admin client with service role key for admin operations
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
