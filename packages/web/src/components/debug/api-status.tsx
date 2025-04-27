"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Server, Info } from "lucide-react"
import {
  checkApiAvailability,
  checkApiAvailabilityDetailed,
  getApiUrl,
  ApiAvailabilityResult,
} from "@/lib/api-config"

export function ApiStatusDebug() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">(
    "loading"
  )
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCard, setShowCard] = useState(false)
  const [apiUrl, setApiUrl] = useState<string>("")
  const [apiPort, setApiPort] = useState<number | null>(null)
  const [availabilityResult, setAvailabilityResult] =
    useState<ApiAvailabilityResult | null>(null)
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  const checkApiStatus = async () => {
    setStatus("loading")
    setError(null)

    // Get the API URL for display
    const currentApiUrl = getApiUrl("/health")
    setApiUrl(currentApiUrl)

    // Extract port from URL
    try {
      const url = new URL(currentApiUrl)
      const port = parseInt(url.port || "3001")
      setApiPort(port)
    } catch (e) {
      setApiPort(3001) // Default fallback
    }

    // First try the proxy endpoint which avoids CORS issues
    try {
      console.log("Trying API health check via Next.js API proxy route")
      const response = await fetch("/api/health-check", {
        method: "GET",
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setDetails(data)

        if (data.apiServer === "healthy") {
          console.log("API server is healthy via proxy route:", data)
          setStatus("online")

          // Update URL if available
          if (data.apiUrl) {
            setApiUrl(data.apiUrl)

            // Try to extract port from URL
            try {
              const url = new URL(data.apiUrl)
              const port = parseInt(url.port || "3001")
              setApiPort(port)
            } catch (e) {
              // Keep existing port
            }
          }

          return
        } else {
          console.log("API server is not healthy via proxy route:", data)
          // Continue to direct check as fallback
        }
      } else {
        console.log(
          "Proxy health check returned non-OK status:",
          response.status
        )
        // Continue to direct check as fallback
      }
    } catch (proxyErr) {
      console.error("Proxy health check failed:", proxyErr)
      // Continue to direct check as fallback
    }

    // If proxy check fails, try direct API health endpoint
    try {
      console.log("Trying direct API health check")
      const result = await checkApiAvailabilityDetailed()
      setAvailabilityResult(result)

      if (result.available) {
        console.log("API server is available via direct check:", result)
        setStatus("online")

        // Update URL and port from the result
        if (result.url) {
          setApiUrl(result.url)
        }

        if (result.port) {
          setApiPort(result.port)
        }

        setDetails({
          apiServer: "healthy",
          directCheck: true,
          port: result.port,
          url: result.url,
        })
        return
      }

      // If we get here, both checks failed
      console.error("Both proxy and direct API checks failed")
      setStatus("offline")
      setError(result.error || "API server is not responding correctly")
    } catch (err) {
      console.error("Unexpected error during API status check:", err)
      setStatus("offline")
      setError(
        err instanceof Error ? err.message : "Failed to check API status"
      )
    }
  }

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return

    checkApiStatus()

    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== "development") return null

  if (!showCard) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant={status === "online" ? "outline" : "destructive"}
          onClick={() => setShowCard(true)}
          className="opacity-80 hover:opacity-100"
        >
          <Server className="mr-1 h-4 w-4" />
          API:{" "}
          {status === "loading"
            ? "Checking..."
            : status === "online"
              ? "Online"
              : "Offline"}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">
              API Server Status
            </CardTitle>
            <Badge variant={status === "online" ? "outline" : "destructive"}>
              {status === "loading" && "Checking..."}
              {status === "online" && "Online"}
              {status === "offline" && "Offline"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2 text-xs">
          {status === "loading" && <p>Checking API server status...</p>}

          {status === "online" && (
            <div className="space-y-2">
              <div className="flex items-center text-green-600 dark:text-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                <p>API server is running correctly</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                API URL: {apiUrl}
              </p>
              <p className="text-xs text-muted-foreground">
                Port: {apiPort || 3001}
              </p>
              {details?.directCheck && (
                <p className="text-xs text-muted-foreground">
                  ✓ Direct connection successful
                </p>
              )}
            </div>
          )}

          {status === "offline" && (
            <div className="space-y-2">
              <div className="flex items-center text-red-600 dark:text-red-500">
                <AlertCircle className="h-4 w-4 mr-1" />
                <p>API server is not running or inaccessible</p>
              </div>
              {error && (
                <p className="text-xs text-muted-foreground">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Attempted API URL: {apiUrl}
              </p>

              {/* Debug information */}
              {availabilityResult && (
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs p-0 h-auto"
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                  >
                    <Info className="h-3 w-3 mr-1" />
                    {showDebugInfo ? "Hide debug info" : "Show debug info"}
                  </Button>

                  {showDebugInfo &&
                    availabilityResult.attempts &&
                    availabilityResult.attempts.length > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs">
                        <p className="font-semibold">Connection attempts:</p>
                        <ul className="mt-1 space-y-1">
                          {availabilityResult.attempts.map((attempt, i) => (
                            <li key={i} className="text-xs">
                              Port {attempt.port}:{" "}
                              {attempt.error || "Unknown error"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              <div className="mt-2 p-2 bg-muted rounded-md">
                <p className="font-mono text-xs">
                  Start API server by running:
                </p>
                <code className="text-xs">cd packages/api && npm run dev</code>
                <p className="mt-2 text-xs">
                  Or update the API URL in <code>.env.local</code>:
                </p>
                <code className="text-xs">
                  NEXT_PUBLIC_API_URL=http://localhost:3001
                </code>

                <p className="mt-2 text-xs font-semibold">
                  Note: Make sure no other server is running on port 3001
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowCard(false)}>
            Hide
          </Button>
          <Button variant="outline" size="sm" onClick={checkApiStatus}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
