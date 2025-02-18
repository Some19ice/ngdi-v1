import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { z } from "zod"

const onboardingSchema = z.object({
  name: z.string().min(2),
  organization: z.string().min(2),
  department: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = onboardingSchema.parse(body)

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        organization: validatedData.organization,
        department: validatedData.department,
        phone: validatedData.phone,
      },
    })

    // Log the profile update
    await redis.lpush(
      "auth:logs",
      JSON.stringify({
        event: "profileUpdate",
        userId: session.user.id,
        timestamp: new Date().toISOString(),
      })
    )

    return NextResponse.json(
      {
        user: {
          name: updatedUser.name,
          organization: updatedUser.organization,
          department: updatedUser.department,
          phone: updatedUser.phone,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
