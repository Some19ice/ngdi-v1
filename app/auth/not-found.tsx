import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthNotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The authentication page you are looking for does not exist.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/auth/signin">Go to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
