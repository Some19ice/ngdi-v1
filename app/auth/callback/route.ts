import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      
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