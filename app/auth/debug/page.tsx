import { AuthTest } from "./auth-test"
import { TokenTest } from "./token-test"

export const metadata = {
  title: "Auth Debug",
  description: "Debug authentication issues",
}

export default function AuthDebugPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Authentication Debug Tools</h1>
        <p className="text-muted-foreground">
          Use these tools to diagnose and fix authentication issues
        </p>
      </div>

      <AuthTest />
      <TokenTest />
    </div>
  )
}
