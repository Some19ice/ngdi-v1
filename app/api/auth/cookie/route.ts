import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

function parseCookieValue(value: string | undefined) {
  if (!value) return null
  try {
    // Handle base64 encoded cookies
    if (value.startsWith("base64-")) {
      try {
        const decoded = Buffer.from(value.slice(7), "base64").toString()

        // Try to parse as JSON if it looks like JSON
        if (decoded.trim().startsWith("{") && decoded.trim().endsWith("}")) {
          try {
            return JSON.parse(decoded)
          } catch (jsonError) {
            // If JSON parsing fails, return the raw decoded string
            console.error("Failed to parse base64-decoded JSON:", jsonError)
            return decoded
          }
        }
        // If it doesn't look like JSON, just return the decoded string
        return decoded
      } catch (e) {
        console.error("Error decoding base64 cookie:", e)
        return value
      }
    }

    // Try to parse as JSON if it looks like JSON
    if (value.trim().startsWith("{") && value.trim().endsWith("}")) {
      try {
        return JSON.parse(value)
      } catch (jsonError) {
        // If JSON parsing fails, return the raw decoded string
        return value
      }
    }

    // Return the value as is
    return value
  } catch (error) {
    console.error("Error parsing cookie:", error)
    return value
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get("name")

  if (!name) {
    return NextResponse.json(
      { error: "Cookie name is required" },
      { status: 400 }
    )
  }

  const cookieStore = cookies()
  const cookie = cookieStore.get(name)
  const value = parseCookieValue(cookie?.value)

  return NextResponse.json({ value })
}

export async function POST(request: Request) {
  try {
    const { name, value, options } = (await request.json()) as {
      name: string
      value: string | object
      options: Omit<ResponseCookie, "name" | "value">
    }

    if (!name) {
      return NextResponse.json(
        { error: "Cookie name is required" },
        { status: 400 }
      )
    }

    // Process the value
    let processedValue: string

    // Convert objects to JSON strings
    if (typeof value === "object") {
      processedValue = JSON.stringify(value)
    } else {
      processedValue = String(value)
    }

    // Handle large values with base64 encoding
    if (processedValue.length > 3072) {
      processedValue = `base64-${Buffer.from(processedValue).toString(
        "base64"
      )}`
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name,
      value: processedValue,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      path: "/",
      ...options,
    })

    return response
  } catch (error) {
    console.error("Error setting cookie:", error)
    return NextResponse.json({ error: "Failed to set cookie" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get("name")

  if (!name) {
    return NextResponse.json(
      { error: "Cookie name is required" },
      { status: 400 }
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name,
    value: "",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  })

  return response
}
