"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "./supabase-client"
import { Session, User } from "@supabase/supabase-js"
import { toast } from "sonner"

// Define the auth context type
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  navigate: (path: string) => void
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  const supabase = createClient()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setSession(session)
          setUser(session.user)
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          (event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            
            // Log auth events in development
            if (process.env.NODE_ENV === "development") {
              console.log("Auth state changed:", event, session?.user?.id)
            }
          }
        )
        
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeAuth()
  }, [])
  
  // Login function
  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set remember me option
          // This affects the session duration
          ...(rememberMe && { 
            // Extend session if remember me is checked
            // Default is 1 hour, extended is 30 days
            sessionDurationSeconds: 30 * 24 * 60 * 60 
          })
        }
      })
      
      if (error) throw error
      
      // Set user and session
      setUser(data.user)
      setSession(data.session)
      
      return data
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // Redirect to email verification page
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/verify`,
        }
      })
      
      if (error) throw error
      
      // Set user and session
      setUser(data.user)
      setSession(data.session)
      
      // Show success message
      toast.success("Registration successful! Please check your email to verify your account.")
      
      return data
    } catch (error: any) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      // Clear user and session
      setUser(null)
      setSession(null)
      
      // Redirect to home page
      router.push("/")
      router.refresh()
    } catch (error: any) {
      console.error("Logout error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })
      
      if (error) throw error
      
      // Show success message
      toast.success("Password reset email sent. Please check your inbox.")
    } catch (error: any) {
      console.error("Reset password error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // Update password function
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password,
      })
      
      if (error) throw error
      
      // Show success message
      toast.success("Password updated successfully.")
    } catch (error: any) {
      console.error("Update password error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // Navigation helper
  const navigate = (path: string) => {
    router.push(path)
  }
  
  // Compute authentication state
  const isAuthenticated = !!user && !!session
  
  // Create the context value
  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    navigate,
  }
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}

// Export the hook as the default export
export default useAuth
