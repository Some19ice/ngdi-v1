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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateJwtToken } from "@/lib/auth-client"
import { toast } from "sonner"

export function TokenTest() {
  const [token, setToken] = useState("")
  const [validationResult, setValidationResult] = useState<any>(null)
  const [currentToken, setCurrentToken] = useState<string | null>(null)

  useEffect(() => {
    // Get the current token from localStorage or cookie
    const getToken = () => {
      if (typeof window === "undefined") return null

      // Try to get from localStorage
      try {
        const tokensStr = localStorage.getItem("auth_tokens")
        if (tokensStr) {
          const tokens = JSON.parse(tokensStr)
          if (tokens.accessToken) {
            setCurrentToken(tokens.accessToken)
            return
          }
        }
      } catch (e) {
        console.error("Error reading tokens from localStorage:", e)
      }

      // Try to get from cookie
      const cookies = document.cookie.split(";")
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=")
        if (name === "auth_token" && value) {
          setCurrentToken(value)
          return
        }
      }

      setCurrentToken(null)
    }

    getToken()
  }, [])

  const validateToken = async () => {
    try {
      const tokenToValidate = token || currentToken
      if (!tokenToValidate) {
        toast.error("No token to validate")
        return
      }

      const result = await validateJwtToken(tokenToValidate)
      setValidationResult(result)

      if (result.isValid) {
        toast.success("Token is valid")
      } else {
        toast.error(`Token validation failed: ${result.error}`)
      }
    } catch (error) {
      console.error("Error validating token:", error)
      toast.error("Error validating token")
    }
  }

  const createMockAdminToken = () => {
    const mockToken = {
      accessToken: `mock_token_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresAt: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    }

    localStorage.setItem("auth_tokens", JSON.stringify(mockToken))
    document.cookie = `auth_token=${mockToken.accessToken}; path=/; max-age=86400`

    setCurrentToken(mockToken.accessToken)
    toast.success("Mock admin token created")
  }

  const createMockNodeOfficerToken = () => {
    // Create a JWT-like token with NODE_OFFICER role
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    const payload = btoa(
      JSON.stringify({
        sub: "mock-user-id",
        email: "nodeofficer@example.com",
        role: "NODE_OFFICER",
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      })
    )
    const signature = btoa("mock_signature") // Not a real signature

    const mockToken = {
      accessToken: `${header}.${payload}.${signature}`,
      refreshToken: `mock_refresh_${Date.now()}`,
      expiresAt: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    }

    localStorage.setItem("auth_tokens", JSON.stringify(mockToken))
    document.cookie = `auth_token=${mockToken.accessToken}; path=/; max-age=86400`

    setCurrentToken(mockToken.accessToken)
    toast.success("Mock Node Officer token created")
  }

  const clearTokens = () => {
    localStorage.removeItem("auth_tokens")
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setCurrentToken(null)
    setValidationResult(null)
    toast.success("Tokens cleared")
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Token Validation Test</CardTitle>
        <CardDescription>
          Test token validation to diagnose authentication issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Current Token</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {currentToken
              ? `Token exists (${currentToken.substring(0, 10)}...)`
              : "No token found"}
          </p>

          <div className="flex space-x-2 mt-2">
            <Button onClick={validateToken} variant="secondary">
              Validate Current Token
            </Button>
            <Button onClick={clearTokens} variant="outline">
              Clear Tokens
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">Custom Token</Label>
          <Input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter a JWT token to validate"
          />
          <Button onClick={validateToken} className="w-full">
            Validate Custom Token
          </Button>
        </div>

        {validationResult && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">Validation Result</h3>
            <div className="p-4 border rounded-md mt-2 bg-muted">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(validationResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-lg font-medium">Development Tools</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Create test tokens for development purposes
          </p>
          <Button onClick={createMockAdminToken} className="w-full">
            Create Mock Admin Token
          </Button>
          <Button onClick={createMockNodeOfficerToken} className="w-full mt-2">
            Create Mock Node Officer Token
          </Button>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/auth/debug/server")}
          >
            Check Server-Side Auth
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Back to Home
        </Button>
        <div className="flex space-x-2">
          <Button onClick={() => (window.location.href = "/admin")}>
            Try Admin Route
          </Button>
          <Button onClick={() => (window.location.href = "/metadata/add")}>
            Try Metadata/Add Route
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
