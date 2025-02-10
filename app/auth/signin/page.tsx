"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <Button
          onClick={() => signIn("supabase", { callbackUrl: "/metadata" })}
          className="w-full"
        >
          Sign in with Supabase
        </Button>
      </Card>
    </div>
  )
} 