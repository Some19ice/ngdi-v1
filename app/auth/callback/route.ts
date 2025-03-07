// This file is intentionally empty to allow the page component to handle the callback
// The route handler is not needed for the implicit flow

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { signIn } from "next-auth/react" // This won't work in a server component

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const provider = requestUrl.searchParams.get("provider")

  console.log("Auth callback received:", {
    code: code ? "Present" : "Not present",
    provider,
    url: request.url,
  })

  // If this is a NextAuth callback, let NextAuth handle it
  if (provider === "google" || requestUrl.pathname.includes("api/auth")) {
    console.log("Detected NextAuth callback, redirecting to home")
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If there's no code, redirect to the sign-in page
  if (!code) {
    console.log("No code found, redirecting to sign-in")
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  try {
    // Create a Supabase client for handling the OAuth callback
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "https://srbuueyoxonxzrswbzdu.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYnV1ZXlveG9ueHpyc3diemR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMTQ0NzIsImV4cCI6MjA1NDU5MDQ3Mn0.Z0nDXkUFEVD9A-_jbOWqkcIEhYzy12s8EqJ9uDlyqC4",
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Set cookies with appropriate options for persistence
            cookieStore.set(name, value, {
              ...options,
              // Ensure cookies persist for a reasonable time
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: "/",
            })
          },
          remove(name: string, options: any) {
            cookieStore.set(name, "", { ...options, maxAge: 0 })
          },
        },
      }
    )

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      // Redirect to sign-in page with error
      return NextResponse.redirect(
        new URL(
          `/auth/signin?error=${encodeURIComponent(error.message)}`,
          request.url
        )
      )
    }

    console.log("Supabase authentication successful")

    // After successful Supabase auth, redirect to a special page that will trigger NextAuth sync
    return NextResponse.redirect(
      new URL("/auth/sync-session?provider=supabase", request.url)
    )
  } catch (error) {
    console.error("Unexpected error during OAuth callback:", error)
    // Redirect to sign-in page with generic error
    return NextResponse.redirect(
      new URL("/auth/signin?error=Authentication%20failed", request.url)
    )
  }
}
