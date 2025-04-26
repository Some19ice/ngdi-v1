import { createClient } from '@supabase/supabase-js'
import { UserRole } from './constants'

// Create a Supabase client for authentication
export const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define the user type
export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  createdAt?: string
  lastLoginAt?: string
  metadata?: {
    location?: string
  }
}

// Define the session type
export interface Session {
  user: User
  accessToken: string
  refreshToken: string
  expires: string
}

// Authentication client
export const authClient = {
  // Login with email and password
  async login(email: string, password: string, rememberMe: boolean = false): Promise<Session> {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.session) {
      throw new Error('No session returned from Supabase')
    }

    // Get user role from user metadata
    const role = data.user?.user_metadata?.role || UserRole.USER

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
        role: role as UserRole,
        createdAt: data.user.created_at,
        lastLoginAt: data.user.last_sign_in_at,
        metadata: {
          location: data.user.user_metadata?.location || '',
        },
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expires: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
    }
  },

  // Register a new user
  async register(email: string, password: string, name?: string): Promise<Session> {
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: UserRole.USER,
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.session) {
      throw new Error('No session returned from Supabase')
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
        role: UserRole.USER,
        createdAt: data.user.created_at,
        lastLoginAt: data.user.last_sign_in_at,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expires: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
    }
  },

  // Logout
  async logout(): Promise<void> {
    const { error } = await supabaseAuth.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },

  // Get current session
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabaseAuth.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    if (!data.session) {
      return null
    }

    // Get user role from user metadata
    const role = data.session.user?.user_metadata?.role || UserRole.USER

    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email || '',
        name: data.session.user.user_metadata?.name || '',
        role: role as UserRole,
        createdAt: data.session.user.created_at,
        lastLoginAt: data.session.user.last_sign_in_at,
        metadata: {
          location: data.session.user.user_metadata?.location || '',
        },
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expires: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : '',
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session
  },

  // Refresh token
  async refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const { data, error } = await supabaseAuth.auth.refreshSession()
    
    if (error) {
      console.error('Error refreshing token:', error)
      return null
    }

    if (!data.session) {
      return null
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    }
  },

  // Get current user
  async getUser(): Promise<User | null> {
    const session = await this.getSession()
    return session?.user || null
  },
}
