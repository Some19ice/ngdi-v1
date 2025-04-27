import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * API route to sync tokens from localStorage to cookies
 * This helps with cross-domain authentication issues
 */
export async function POST(request: NextRequest) {
  try {
    // Get tokens from request body
    const { accessToken, refreshToken } = await request.json()

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { success: false, message: "Missing tokens" },
        { status: 400 }
      )
    }

    // Set cookies
    const cookieStore = await cookies()

    // Set auth_token cookie
    cookieStore.set("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    })

    // Set refresh_token cookie
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Set authenticated flag (non-httpOnly so it's visible to JS)
    cookieStore.set("authenticated", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ success: true, message: 'Tokens synced to cookies' })
  } catch (error) {
    console.error('Error syncing tokens:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to sync tokens' },
      { status: 500 }
    )
  }
}
