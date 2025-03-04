import { NextResponse } from "next/server"

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not available in production", { status: 404 })
  }

  return NextResponse.json({
    googleConfigured: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    },
    nextAuth: {
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      url: process.env.NEXTAUTH_URL,
    },
  })
}
