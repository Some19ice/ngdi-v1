"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { createClient } from "@/lib/supabase-client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function SessionDebugPage() {
  const router = useRouter()
  const { user, session } = useAuth()
  const [supabaseSession, setSupabaseSession] = useState<any>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPersistent, setIsPersistent] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isFixing, setIsFixing] = useState(false)

  // Refresh session data
  const refreshSessionData = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get current session
      const { data } = await supabase.auth.getSession()
      setSupabaseSession(data.session)

      // Check persistence status
      if (data.session) {
        setRefreshToken(data.session.refresh_token || null)

        // Calculate expiry time
        const expiresInSeconds = data.session.expires_in
        if (expiresInSeconds) {
          const expiryDate = new Date(Date.now() + expiresInSeconds * 1000)
          setExpiresAt(expiryDate.toLocaleString())
        } else if (data.session.expires_at) {
          const expiryDate = new Date(data.session.expires_at * 1000)
          setExpiresAt(expiryDate.toLocaleString())
        }

        // Check if session is persistent
        const persistentValue = data.session.user?.user_metadata?.persistent
        const rememberMe = data.session.user?.user_metadata?.remember_me
        setIsPersistent(!!(persistentValue || rememberMe))
      }
    } catch (e) {
      console.error("Error refreshing session data:", e)
      toast.error("Failed to refresh session data")
    } finally {
      setIsLoading(false)
    }
  }

  // Fix session persistence
  const fixSessionPersistence = async (persist: boolean) => {
    setIsFixing(true)

    try {
      const supabase = createClient()

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          persistent: persist,
          remember_me: persist,
        },
      })

      // Refresh session
      const { data } = await supabase.auth.refreshSession()

      if (data.session) {
        toast.success(`Session persistence ${persist ? "enabled" : "disabled"}`)
        refreshSessionData()
      } else {
        toast.error("Couldn't update session persistence")
      }
    } catch (e) {
      console.error("Error fixing session persistence:", e)
      toast.error("Failed to update session persistence")
    } finally {
      setIsFixing(false)
    }
  }

  // Force refresh token
  const forceRefreshToken = async () => {
    setIsFixing(true)

    try {
      const supabase = createClient()

      // Force refresh the session
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        throw error
      }

      if (data.session) {
        toast.success("Session refreshed successfully")
        refreshSessionData()
      } else {
        toast.error("Couldn't refresh session")
      }
    } catch (e) {
      console.error("Error refreshing token:", e)
      toast.error("Failed to refresh token")
    } finally {
      setIsFixing(false)
    }
  }

  // Sign in again without redirect
  const reAuthenticate = async () => {
    if (!user?.email) {
      toast.error("User email not available")
      return
    }

    const password = prompt("Enter your password to re-authenticate:")
    if (!password) return

    setIsFixing(true)

    try {
      const supabase = createClient()

      // Sign in with current credentials to get a fresh session
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
        options: {
          persistSession: true,
        },
      })

      if (error) {
        throw error
      }

      if (data.session) {
        // Set persistence
        await supabase.auth.updateUser({
          data: {
            persistent: true,
            remember_me: true,
          },
        })

        toast.success("Re-authenticated successfully")
        refreshSessionData()
      }
    } catch (e) {
      console.error("Error re-authenticating:", e)
      toast.error("Re-authentication failed")
    } finally {
      setIsFixing(false)
    }
  }

  // Initialize
  useEffect(() => {
    // First verify localStorage is available
    const canUseStorage = (() => {
      try {
        const testKey = "supabase-storage-test"
        localStorage.setItem(testKey, "test")
        localStorage.removeItem(testKey)
        return true
      } catch (e) {
        console.error("LocalStorage not available:", e)
        return false
      }
    })()

    if (!canUseStorage) {
      toast.error(
        "LocalStorage is not available - session persistence won't work"
      )
    }

    // Add a slight delay to allow the auth state to initialize
    const timer = setTimeout(() => {
      refreshSessionData()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="outline"
          onClick={refreshSessionData}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="relative">
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Current session persistence state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-1 text-sm">Session Active</h3>
                <p className="text-2xl font-bold">
                  {supabaseSession ? (
                    <span className="text-green-500">Yes</span>
                  ) : (
                    <span className="text-red-500">No</span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1 text-sm">Persistence Status</h3>
                <p className="text-2xl font-bold">
                  {isPersistent ? (
                    <span className="text-green-500">Enabled</span>
                  ) : (
                    <span className="text-red-500">Disabled</span>
                  )}
                </p>
              </div>

              {expiresAt && (
                <div>
                  <h3 className="font-medium mb-1 text-sm">Expires At</h3>
                  <p className="text-sm">{expiresAt}</p>
                </div>
              )}

              {refreshToken && (
                <div>
                  <h3 className="font-medium mb-1 text-sm">Refresh Token</h3>
                  <p className="text-sm text-muted-foreground">
                    {refreshToken ? "Available" : "Not available"}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="session-persistence">Session Persistence</Label>
                <p className="text-xs text-muted-foreground">
                  Enable to keep your session active between browser restarts
                </p>
              </div>
              <Switch
                id="session-persistence"
                checked={isPersistent}
                onCheckedChange={fixSessionPersistence}
                disabled={isFixing || !supabaseSession}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={forceRefreshToken}
              disabled={isFixing || !supabaseSession}
            >
              Refresh Token
            </Button>

            <Button
              variant="secondary"
              onClick={reAuthenticate}
              disabled={isFixing || !user?.email}
            >
              Re-authenticate
            </Button>
          </CardFooter>

          {isFixing && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p>Processing...</p>
              </div>
            </div>
          )}
        </Card>

        {!supabaseSession && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-red-600 dark:text-red-400">
                  No Active Session
                </CardTitle>
              </div>
              <CardDescription className="text-red-600/80 dark:text-red-400/80">
                You need to sign in to check session persistence
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full"
              >
                Go to Sign In
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Session Data</CardTitle>
            <CardDescription>Raw session information</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs max-h-[400px]">
              {JSON.stringify(supabaseSession, null, 2) ||
                "No session data available"}
            </pre>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => router.push("/auth/debug")}>
          Back to Debug Menu
        </Button>
      </div>
    </div>
  )
}
