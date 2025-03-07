import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "@/lib/auth/types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      ...session.user,
      role: session.user.user_metadata.role || UserRole.USER,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const requestUrl = new URL(request.url)
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const action = formData.get("action") as "signin" | "signup"

    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${requestUrl.origin}/auth/callback`,
          data: {
            role: UserRole.USER,
          },
        },
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        message: "Check your email for the confirmation link",
      })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      user: {
        ...data.user,
        role: data.user?.user_metadata.role || UserRole.USER,
      },
    })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
