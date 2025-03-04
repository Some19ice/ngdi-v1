import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Find token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    })

    // Check if token exists and is not expired
    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    if (new Date() > verificationToken.expires) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 })
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      email: verificationToken.identifier,
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
