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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import {
  checkAuthStatus,
  resetAuthState,
  refreshAuthSession,
} from "@/lib/auth/supabase-auth-check"
import { hasRememberMeFlag } from "@/lib/auth/session-utils"

// Type for auth diagnostic results
interface DiagnosticResult {
  isAuthenticated: boolean
  hasSession: boolean
  hasUser: boolean
  hasValidRole: boolean
  email?: string | null
  role?: string | null
  sessionExpiry?: string | null
  rememberMeEnabled: boolean
  timestamp: Date
}

export default function AuthDiagnosticPage() {
  const { user, userRole, isLoading, isAuthenticated } = useAuth()
  const [diagnosticResults, setDiagnosticResults] = useState<
    DiagnosticResult[]
  >([])
  const [isRunningCheck, setIsRunningCheck] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [localStorageItems, setLocalStorageItems] = useState<
    { key: string; value: string }[]
  >([])
  const [cookies, setCookies] = useState<string[]>([])

  // Run a diagnostic check and store the results
  const runDiagnosticCheck = async () => {
    setIsRunningCheck(true)
    try {
      const result = await checkAuthStatus()
      setDiagnosticResults([
        {
          ...result,
          timestamp: new Date(),
        },
        ...diagnosticResults,
      ])

      // Also update the storage info
      updateStorageInfo()
    } catch (e) {
      console.error("Error running diagnostic:", e)
    } finally {
      setIsRunningCheck(false)
    }
  }

  // Reset auth state for troubleshooting
  const handleReset = async () => {
    setIsResetting(true)
    try {
      await resetAuthState()
      // Run another check after reset
      await runDiagnosticCheck()
    } catch (e) {
      console.error("Error resetting auth state:", e)
    } finally {
      setIsResetting(false)
    }
  }

  // Refresh the session
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshAuthSession()
      // Run another check after refresh
      await runDiagnosticCheck()
    } catch (e) {
      console.error("Error refreshing session:", e)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Get localStorage and cookie info
  const updateStorageInfo = () => {
    if (typeof window === "undefined") return

    // Get localStorage items
    try {
      const items: { key: string; value: string }[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          let value = localStorage.getItem(key) || ""
          if (value.length > 50) {
            value = value.substring(0, 50) + "..."
          }
          items.push({ key, value })
        }
      }
      setLocalStorageItems(items)
    } catch (e) {
      console.error("Error accessing localStorage:", e)
    }

    // Get cookies
    try {
      const cookieList = document.cookie.split(";").map((c) => c.trim())
      setCookies(cookieList)
    } catch (e) {
      console.error("Error accessing cookies:", e)
    }
  }

  // Run initial check
  useEffect(() => {
    runDiagnosticCheck()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Status badge component
  const StatusBadge = ({ status }: { status: boolean }) => {
    return status ? (
      <Badge
        variant="default"
        className="ml-2 flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        <span>Yes</span>
      </Badge>
    ) : (
      <Badge variant="destructive" className="ml-2 flex items-center gap-1">
        <XCircle className="h-3.5 w-3.5" />
        <span>No</span>
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Authentication Diagnostic
          </h1>
          <p className="text-muted-foreground">
            This page helps diagnose authentication issues by checking your
            current auth state
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Authentication Status</CardTitle>
              <CardDescription>
                Current auth status from context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Authenticated:</span>
                  <StatusBadge status={isAuthenticated} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Loading:</span>
                  <StatusBadge status={isLoading} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Has user:</span>
                  <StatusBadge status={!!user} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Has role:</span>
                  <StatusBadge status={!!userRole} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Remember me:</span>
                  <StatusBadge status={hasRememberMeFlag()} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="text-sm text-muted-foreground">
                {user?.email && <div>Email: {user.email}</div>}
                {userRole && <div>Role: {userRole}</div>}
              </div>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Actions</CardTitle>
              <CardDescription>
                Tools to diagnose and fix auth issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  onClick={runDiagnosticCheck}
                  disabled={isRunningCheck}
                  className="flex items-center gap-2"
                >
                  {isRunningCheck ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Run Diagnostic
                </Button>

                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh Session
                </Button>

                <Button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="flex items-center gap-2"
                  variant="destructive"
                >
                  {isResetting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Reset Auth
                </Button>
              </div>

              {diagnosticResults.length > 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Last check result</AlertTitle>
                  <AlertDescription>
                    {diagnosticResults[0].isAuthenticated ? (
                      <span className="text-green-600 font-medium">
                        Authentication working correctly ✓
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        Authentication check failed ✗
                      </span>
                    )}
                    {!diagnosticResults[0].isAuthenticated && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {!diagnosticResults[0].hasSession &&
                          "• No valid session found"}
                        {!diagnosticResults[0].hasUser &&
                          "• No user data found"}
                        {!diagnosticResults[0].hasValidRole &&
                          "• No valid user role found"}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Diagnostic Details</TabsTrigger>
            <TabsTrigger value="storage">Storage Data</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {diagnosticResults.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No diagnostic checks run yet. Click &quot;Run Diagnostic&quot;
                to check your auth status.
              </div>
            ) : (
              diagnosticResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Diagnostic Check {index + 1}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      <div className="flex items-center justify-between">
                        <span>Authenticated:</span>
                        <StatusBadge status={result.isAuthenticated} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Session exists:</span>
                        <StatusBadge status={result.hasSession} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span>User found:</span>
                        <StatusBadge status={result.hasUser} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Valid role:</span>
                        <StatusBadge status={result.hasValidRole} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Remember me:</span>
                        <StatusBadge status={result.rememberMeEnabled} />
                      </div>

                      {result.email && (
                        <div className="flex items-center justify-between">
                          <span>Email:</span>
                          <span className="font-mono text-sm">
                            {result.email}
                          </span>
                        </div>
                      )}

                      {result.role && (
                        <div className="flex items-center justify-between">
                          <span>Role:</span>
                          <span className="font-mono text-sm">
                            {result.role}
                          </span>
                        </div>
                      )}

                      {result.sessionExpiry && (
                        <div className="flex items-center justify-between">
                          <span>Session expires:</span>
                          <span className="font-mono text-sm">
                            {result.sessionExpiry}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="storage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">LocalStorage Items</CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-auto">
                  {localStorageItems.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No items found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {localStorageItems.map((item, index) => (
                        <div key={index} className="border-b pb-2">
                          <div className="font-medium">{item.key}</div>
                          <div className="text-sm text-muted-foreground font-mono break-all">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cookies</CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-auto">
                  {cookies.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No cookies found
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cookies.map((cookie, index) => (
                        <div
                          key={index}
                          className="border-b pb-2 break-all font-mono text-sm"
                        >
                          {cookie}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
