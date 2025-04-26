"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { UserRole } from "@/lib/auth/constants"

interface AdminDebugContentProps {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

export function AdminDebugContent({ user }: AdminDebugContentProps) {
  const [authDebug, setAuthDebug] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch auth debug info
    const fetchAuthDebug = async () => {
      try {
        const response = await fetch("/api/auth-debug")
        const data = await response.json()
        setAuthDebug(data)
      } catch (error) {
        console.error("Error fetching auth debug:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuthDebug()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Debug Page</h1>

      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">User Information</h2>
        <p>
          <strong>Email:</strong> {user.email || "Not logged in"}
        </p>
        <p>
          <strong>Role:</strong> {user.role || "None"}
        </p>
        <p>
          <strong>Is Admin:</strong>{" "}
          {user.role === UserRole.ADMIN ? "Yes" : "No"}
        </p>
      </div>

      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Auth Debug Information</h2>
        {loading ? (
          <p>Loading auth debug information...</p>
        ) : (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(authDebug, null, 2)}
          </pre>
        )}
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go to Admin Page
        </Link>
        <Link href="/" className="px-4 py-2 bg-gray-500 text-white rounded">
          Go to Home
        </Link>
      </div>
    </div>
  )
}
