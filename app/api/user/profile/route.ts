// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { safeParseJson } from "@/lib/api-utils"
import { revalidateTag } from "next/cache"

// Define a schema for profile updates
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  organization: z
    .string()
    .min(2, "Organization must be at least 2 characters.")
    .optional()
    .nullable(),
  department: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
})

/**
 * PUT /api/user/profile - Update user profile
 */
export async function PUT(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const json = await safeParseJson(req)
    const result = profileUpdateSchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 }
      )
    }

    const data = result.data

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: data.name,
        organization: data.organization,
        department: data.department,
        phone: data.phone,
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

    // Revalidate the profile cache
    revalidateTag("profile")

    // Return the updated user
    return NextResponse.json({
      user: updatedUser,
      message: "Profile updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 })
    }

    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/profile - Get user profile
 */
export async function GET(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
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
