"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

// Define types for Supabase user and session
type SupabaseUser = {
  id: string
  email?: string
  user_metadata?: {
    name?: string
  }
  role?: string
}

type SupabaseSession = {
  expires_at?: number
  token_type?: string
  access_token?: string
  refresh_token?: string
}

export default function AuthTestPage() {
  // Use auth hook but don't trigger any refreshes
  const { session, user, isLoading, isAuthenticated, userRole, isAdmin } = useAuth()
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false)

  // Function to manually check Supabase auth without auto-running
  const checkSupabaseAuth = async () => {
    if (isCheckingSupabase) return;
    
    setIsCheckingSupabase(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables")
      }

      // Create Supabase client with options that won't interfere with existing auth
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: true,
          detectSessionInUrl: false
        }
      })

      // Get session
      const sessionResult = await supabase.auth.getSession()
      if (sessionResult.error) {
        throw sessionResult.error
      }

      setSupabaseSession(sessionResult.data.session as unknown as SupabaseSession)

      // Get user from session or directly
      if (sessionResult.data.session?.user) {
        setSupabaseUser(sessionResult.data.session.user as unknown as SupabaseUser)
      } else {
        const userResult = await supabase.auth.getUser()
        if (userResult.error) {
          throw userResult.error
        }
        setSupabaseUser(userResult.data.user as unknown as SupabaseUser)
      }
    } catch (error) {
      setSupabaseError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsCheckingSupabase(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Read-only mode</AlertTitle>
        <AlertDescription>
          This page only displays authentication information and does not modify your session.
          If you experience any authentication issues after visiting this page, please sign in again.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="custom">Custom Auth</TabsTrigger>
          <TabsTrigger value="supabase">Supabase Auth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Auth Status</CardTitle>
              <CardDescription>
                Shows your current authentication state using the custom auth client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <span
                  className={`px-2 py-1 text-sm rounded ${
                    isAuthenticated ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </span>
                {isLoading && (
                  <span className="ml-2 px-2 py-1 text-sm rounded bg-yellow-500 text-white">
                    Loading...
                  </span>
                )}
              </div>
              <pre className="bg-black text-white p-4 rounded overflow-auto text-sm">
                {JSON.stringify(
                  {
                    authenticated: isAuthenticated,
                    isLoading,
                    userRole,
                    isAdmin,
                    hasUser: !!user,
                    hasUserId: !!user?.id,
                    user: user
                      ? {
                          id: user.id?.substring(0, 8) + "...",
                          name: user.name,
                          email: user.email?.substring(0, 3) + "...",
                          role: user.role,
                          normalizedRole: userRole,
                          hasImage: !!user.image,
                          // These properties might not exist on all user objects
                          hasOrganization: !!(user as any).organization,
                          hasDepartment: !!(user as any).department,
                          hasPhone: !!(user as any).phone,
                        }
                      : null,
                  },
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Supabase Auth Status</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkSupabaseAuth}
                  disabled={isCheckingSupabase}
                >
                  {isCheckingSupabase ? "Checking..." : "Check Supabase Auth"}
                </Button>
              </CardTitle>
              <CardDescription>
                Click the button to check your Supabase authentication status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                {supabaseUser ? (
                  <span className="px-2 py-1 text-sm rounded bg-green-500 text-white">
                    Authenticated
                  </span>
                ) : supabaseError ? (
                  <span className="px-2 py-1 text-sm rounded bg-red-500 text-white">
                    Error
                  </span>
                ) : (
                  <span className="px-2 py-1 text-sm rounded bg-gray-500 text-white">
                    Not Checked
                  </span>
                )}
              </div>
              {supabaseError && (
                <div className="mb-2 p-2 bg-red-100 text-red-800 rounded text-sm">
                  Error: {supabaseError}
                </div>
              )}
              <pre className="bg-black text-white p-4 rounded overflow-auto text-sm">
                {JSON.stringify(
                  {
                    authenticated: !!supabaseUser,
                    hasSession: !!supabaseSession,
                    hasUser: !!supabaseUser,
                    hasUserId: !!supabaseUser?.id,
                    // Session info if available
                    session: supabaseSession
                      ? {
                          expiresAt: supabaseSession.expires_at,
                          tokenType: supabaseSession.token_type,
                          hasAccessToken: !!supabaseSession.access_token,
                          hasRefreshToken: !!supabaseSession.refresh_token,
                        }
                      : null,
                    // Only show partial data for security
                    user: supabaseUser
                      ? {
                          id: supabaseUser.id?.substring(0, 8) + "...",
                          email: supabaseUser.email?.substring(0, 3) + "...",
                          hasMetadata: !!supabaseUser.user_metadata,
                          name: supabaseUser.user_metadata?.name,
                          role: supabaseUser.role,
                        }
                      : null,
                  },
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-4 mt-6">
        <Button asChild variant="default">
          <a href="/auth/signin">Sign In</a>
        </Button>
        <Button asChild variant="destructive">
          <a href="/auth/signout">Sign Out</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/profile">Go to Profile</a>
        </Button>
        <Button asChild variant="secondary">
          <a href="/admin">Try Admin Panel</a>
        </Button>
      </div>
    </div>
  )
}
