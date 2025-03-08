"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/hooks/use-auth"
import {
  hasManualSignOutFlag,
  clearManualSignOutFlag,
} from "@/lib/auth/session-utils"

export default function AuthDebugPage() {
  const { user, userRole, isLoading } = useAuth()
  const [localStorageItems, setLocalStorageItems] = useState<
    { key: string; value: string }[]
  >([])
  const [cookies, setCookies] = useState<string[]>([])
  const [sessionStorageItems, setSessionStorageItems] = useState<
    { key: string; value: string }[]
  >([])
  const [manualSignOutFlag, setManualSignOutFlag] = useState<boolean>(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  // Load debug info
  useEffect(() => {
    if (typeof window === "undefined") return

    // Check localStorage
    const lsItems: { key: string; value: string }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          let value = localStorage.getItem(key) || ""
          // Truncate long values
          if (value && value.length > 50) {
            value = value.substring(0, 50) + "..."
          }
          lsItems.push({ key, value })
        } catch (e) {
          lsItems.push({ key, value: "Error reading value" })
        }
      }
    }
    setLocalStorageItems(lsItems)

    // Check sessionStorage
    const ssItems: { key: string; value: string }[] = []
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          try {
            let value = sessionStorage.getItem(key) || ""
            // Truncate long values
            if (value && value.length > 50) {
              value = value.substring(0, 50) + "..."
            }
            ssItems.push({ key, value })
          } catch (e) {
            ssItems.push({ key, value: "Error reading value" })
          }
        }
      }
    } catch (e) {
      console.error("Error accessing sessionStorage:", e)
    }
    setSessionStorageItems(ssItems)

    // Check cookies
    const cookieList = document.cookie.split(";").map((cookie) => cookie.trim())
    setCookies(cookieList)

    // Check manual signout flag
    setManualSignOutFlag(hasManualSignOutFlag())

    // Get session info from Supabase
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        setSessionInfo({
          hasSession: !!data.session,
          expiresAt: data.session?.expires_at
            ? new Date(data.session.expires_at * 1000).toLocaleString()
            : "N/A",
          user: data.session?.user?.email || "None",
        })
      } catch (e) {
        console.error("Error getting session:", e)
        setSessionInfo({ error: "Failed to get session info" })
      }
    }

    checkSession()
  }, [])

  const clearAllAuthData = async () => {
    if (typeof window === "undefined") return

    try {
      // 1. Clear localStorage
      const authKeys = [
        "supabase.auth.token",
        "supabase.auth.refreshToken",
        "supabase.auth.user",
        "supabase.auth.expires",
        "supabase.auth.data",
        "sb:token",
        "sb-access-token",
        "sb-refresh-token",
        "next-auth.session-token",
        "next-auth.callback-url",
        "next-auth.csrf-token",
        "remember_me",
        "manual_signout",
      ]

      authKeys.forEach((key) => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.error(`Error removing ${key} from localStorage:`, e)
        }
      })

      // 2. Clear sessionStorage
      try {
        sessionStorage.clear()
      } catch (e) {
        console.error("Error clearing sessionStorage:", e)
      }

      // 3. Clear cookies
      const cookiesToClear = [
        "sb-access-token",
        "sb-refresh-token",
        "supabase-auth-token",
        "next-auth.session-token",
        "next-auth.callback-url",
        "next-auth.csrf-token",
      ]

      cookiesToClear.forEach((name) => {
        document.cookie = `${name}=; Max-Age=-1; path=/;`
      })

      // 4. Handle Supabase project-specific cookies
      const allCookies = document.cookie.split(";")
      for (const cookie of allCookies) {
        const [name] = cookie.trim().split("=")
        if (
          name &&
          (name.includes("-auth-token") ||
            name.includes("supabase") ||
            name.includes("sb-"))
        ) {
          document.cookie = `${name}=; Max-Age=-1; path=/;`
        }
      }

      // 5. Call the API to clear server-side state
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force: true }),
      })

      // 6. Refresh the page to update the displayed information
      window.location.reload()
    } catch (e) {
      console.error("Error clearing auth data:", e)
      alert("Error clearing authentication data. See console for details.")
    }
  }

  const clearManualFlag = () => {
    clearManualSignOutFlag()
    window.location.reload()
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
          <CardDescription>
            This page helps diagnose authentication issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Current Auth State</h3>
            <div className="bg-muted p-4 rounded-md">
              <p>
                <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
              </p>
              <p>
                <strong>User:</strong> {user ? user.email : "Not authenticated"}
              </p>
              <p>
                <strong>Role:</strong> {userRole || "None"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Supabase Session</h3>
            <div className="bg-muted p-4 rounded-md">
              {sessionInfo ? (
                <>
                  <p>
                    <strong>Has Session:</strong>{" "}
                    {sessionInfo.hasSession ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Expires At:</strong> {sessionInfo.expiresAt}
                  </p>
                  <p>
                    <strong>User Email:</strong> {sessionInfo.user}
                  </p>
                  {sessionInfo.error && (
                    <Alert className="mt-2 bg-red-50 text-red-600 p-2">
                      {sessionInfo.error}
                    </Alert>
                  )}
                </>
              ) : (
                <p>Loading session info...</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Manual Sign-Out Flag</h3>
            <div className="bg-muted p-4 rounded-md flex items-center justify-between">
              <p>
                <strong>Flag Set:</strong> {manualSignOutFlag ? "Yes" : "No"}
              </p>
              {manualSignOutFlag && (
                <Button variant="outline" size="sm" onClick={clearManualFlag}>
                  Clear Flag
                </Button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              LocalStorage Items ({localStorageItems.length})
            </h3>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-40">
              {localStorageItems.length > 0 ? (
                <ul className="space-y-1">
                  {localStorageItems.map((item, i) => (
                    <li key={i} className="text-sm">
                      <strong>{item.key}:</strong> {item.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items found</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              SessionStorage Items ({sessionStorageItems.length})
            </h3>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-40">
              {sessionStorageItems.length > 0 ? (
                <ul className="space-y-1">
                  {sessionStorageItems.map((item, i) => (
                    <li key={i} className="text-sm">
                      <strong>{item.key}:</strong> {item.value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items found</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">
              Cookies ({cookies.length})
            </h3>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-40">
              {cookies.length > 0 ? (
                <ul className="space-y-1">
                  {cookies.map((cookie, i) => (
                    <li key={i} className="text-sm">
                      {cookie}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No cookies found</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            variant="destructive"
            onClick={clearAllAuthData}
            className="w-full"
          >
            Reset All Authentication Data
          </Button>
          <div className="flex space-x-4 w-full">
            <Button
              variant="outline"
              className="w-1/2"
              onClick={() => (window.location.href = "/auth/signin")}
            >
              Go to Sign In
            </Button>
            <Button
              variant="outline"
              className="w-1/2"
              onClick={() => window.location.reload()}
            >
              Refresh Debug Info
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
