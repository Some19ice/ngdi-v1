import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      // Exchange the authorization code for tokens
      const response = await axios.post(`${API_URL}/api/auth/callback`, {
        code,
      })

      const { accessToken, refreshToken } = response.data

      // Set cookies for the tokens
      cookies().set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      })

      cookies().set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      // After successful authentication, redirect to the home page or a specified redirect URL
      const redirectTo = cookies().get("redirectTo")?.value
      const redirectUrl = redirectTo || "/"

      // Clear the redirect cookie
      cookies().delete("redirectTo")

      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(
        new URL("/auth/signin?error=callback_error", requestUrl.origin)
      )
    }
  }

  // If no code is present, redirect to sign in
  return NextResponse.redirect(
    new URL("/auth/signin?error=no_code", requestUrl.origin)
  )
}
