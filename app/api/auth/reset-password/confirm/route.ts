// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { passwordSchema, hashPassword } from "@/lib/auth/validation"
import { safeParseJson } from "@/lib/api-utils"

const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordSchema,
})

export async function POST(req: Request) {
  try {
    const json = await safeParseJson(req)
    const body = resetPasswordConfirmSchema.parse(json)

    // Find token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token: body.token,
      },
    })

    // Check if token exists and is not expired
    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }

    if (new Date() > verificationToken.expires) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 })
    }

    // Find user with email
    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash the new password
    const hashedPassword = await hashPassword(body.password)

    // Update user's password
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    })

    // Add a log entry for security purposes
    console.log(`Password reset completed for user: ${user.email}`)

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Password reset confirmation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
