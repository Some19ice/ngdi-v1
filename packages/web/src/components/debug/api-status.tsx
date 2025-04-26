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
import { AlertCircle, CheckCircle, Server } from "lucide-react"

export function ApiStatusDebug() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">(
    "loading"
  )
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCard, setShowCard] = useState(false)

  const checkApiStatus = async () => {
    setStatus("loading")
    setError(null)

    try {
      const response = await fetch("/api/health-check", {
        method: "GET",
        cache: "no-store",
      })

      const data = await response.json()
      setDetails(data)

      if (data.apiServer === "healthy") {
        setStatus("online")
      } else {
        setStatus("offline")
        setError(data.message || "API server is not responding correctly")
      }
    } catch (err) {
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
            <div className="flex items-center text-green-600 dark:text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              <p>API server is running correctly</p>
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
              <div className="mt-2 p-2 bg-muted rounded-md">
                <p className="font-mono text-xs">
                  Start API server by running:
                </p>
                <code className="text-xs">cd packages/api && npm run dev</code>
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
