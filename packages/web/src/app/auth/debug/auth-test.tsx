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
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AuthTest() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [tokenInfo, setTokenInfo] = useState<any>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const isAuth = await authClient.isAuthenticated()
      setIsAuthenticated(isAuth)

      if (isAuth) {
        const session = await authClient.getSession()
        setUserInfo(session?.user || null)

        // Get token info without exposing full token
        const token = authClient.getAccessToken()
        if (token) {
          setTokenInfo({
            exists: true,
            length: token.length,
            preview: `${token.substring(0, 10)}...${token.substring(token.length - 5)}`,
          })
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
    }
  }

  const clearTokens = () => {
    localStorage.removeItem("auth_tokens")
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    toast.success("Auth tokens cleared")
    checkAuthStatus()
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
        <CardDescription>
          Use this tool to diagnose authentication issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Authentication Status</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Current authentication state in the application
          </p>
          <div className="p-4 border rounded-md">
            <p>
              <strong>Is Authenticated:</strong>{" "}
              {isAuthenticated === null
                ? "Checking..."
                : isAuthenticated
                  ? "Yes"
                  : "No"}
            </p>

            {tokenInfo && (
              <div className="mt-2">
                <p>
                  <strong>Token Info:</strong>
                </p>
                <pre className="bg-muted p-2 rounded text-xs mt-1">
                  {JSON.stringify(tokenInfo, null, 2)}
                </pre>
              </div>
            )}

            {userInfo && (
              <div className="mt-2">
                <p>
                  <strong>User Info:</strong>
                </p>
                <pre className="bg-muted p-2 rounded text-xs mt-1">
                  {JSON.stringify(userInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium">Troubleshooting</h3>
          <p className="text-sm text-muted-foreground mb-2">
            If you&apos;re having authentication issues, try these options
          </p>
          <div className="flex flex-col space-y-2">
            <Button variant="outline" onClick={clearTokens}>
              Sign Out (Clear Auth Tokens)
            </Button>
            <Button variant="secondary" onClick={checkAuthStatus}>
              Refresh Status
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
        </Button>
        <Button onClick={() => router.push("/auth/signin")}>
          Go to Sign In
        </Button>
      </CardFooter>
    </Card>
  )
}
