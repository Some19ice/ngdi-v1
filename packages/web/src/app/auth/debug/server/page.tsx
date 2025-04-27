import { cookies, headers as getHeaders } from "next/headers"
import { validateJwtToken } from "@/lib/auth-client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Server Auth Debug",
  description: "Debug server-side authentication",
}

export const dynamic = "force-dynamic"

export default async function ServerAuthDebugPage() {
  // Get the auth token from cookies
  const cookieStore = await cookies()
  const authToken = cookieStore.get("auth_token")?.value

  // Get request headers
  const headersList = getHeaders()
  const headerEntries = Array.from(headersList.entries())

  // Initialize validation result
  let validationResult = null
  let error = null

  // Validate the token if it exists
  if (authToken) {
    try {
      validationResult = await validateJwtToken(authToken)
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error"
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Server-Side Authentication Debug</CardTitle>
          <CardDescription>
            This page shows how your authentication looks from the server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Auth Token</h3>
            <div className="p-4 border rounded-md mt-2 bg-muted">
              {authToken ? (
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  Token exists: {authToken.substring(0, 20)}...
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No auth token found in cookies
                </p>
              )}
            </div>
          </div>

          {validationResult && (
            <div>
              <h3 className="text-lg font-medium">Validation Result</h3>
              <div className="p-4 border rounded-md mt-2 bg-muted">
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(validationResult, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {error && (
            <div>
              <h3 className="text-lg font-medium text-destructive">Error</h3>
              <div className="p-4 border border-destructive rounded-md mt-2 bg-destructive/10">
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {error}
                </pre>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium">Request Headers</h3>
            <div className="p-4 border rounded-md mt-2 bg-muted">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(Object.fromEntries(headerEntries), null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
