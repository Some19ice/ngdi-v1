"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function TestMiddlewarePage() {
  const [message, setMessage] = useState(
    "This page is not protected by middleware"
  )

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Middleware Test Page</h1>

      <div className="mb-6 p-4 border rounded-lg">
        <p>{message}</p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin-debug"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go to Admin Debug Page
        </Link>
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
