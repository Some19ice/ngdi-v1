"use client"

import { useEffect } from "react"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface UnauthorizedErrorProps {
  error: Error
  reset: () => void
}

export function UnauthorizedError({ error, reset }: UnauthorizedErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // Log the error
    console.error("Authorization Error:", error)
  }, [error])

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-yellow-500" />
        </div>
        <CardTitle className="text-xl">Permission Denied</CardTitle>
        <CardDescription>
          {error?.message || "You don't have permission to perform this action"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              reset()
              router.back()
            }}
          >
            Try Again
          </Button>
          <Button variant="default" onClick={() => router.push("/")}>
            Go to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
