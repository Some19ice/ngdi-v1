// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { safeParseJson } from "@/lib/api-utils"

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  organization: z
    .string()
    .min(2, "Organization must be at least 2 characters.")
    .optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
})

export async function PUT(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const json = await safeParseJson(req)
    const body = profileUpdateSchema.parse(json)

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: body.name,
        organization: body.organization || null,
        department: body.department || null,
        phone: body.phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        organization: true,
        department: true,
        phone: true,
        role: true,
      },
    })

    // Return the updated user
    return NextResponse.json({
      user: updatedUser,
      message: "Profile updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch the user profile
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        organization: true,
        department: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return the user profile
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
