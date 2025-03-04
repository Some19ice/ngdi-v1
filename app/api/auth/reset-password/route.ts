// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/auth/validation"
import { createTransport } from "nodemailer"
import { PasswordResetEmailTemplate } from "@/lib/auth/email-templates"
import { redis } from "@/lib/redis"
import { safeParseJson } from "@/lib/api-utils"

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(req: Request) {
  try {
    // Rate limiting for reset password attempts
    const ip = req.headers.get("x-forwarded-for") || "anonymous"
    const rateLimitKey = `reset-password:${ip}`
    const attempts = await redis.incr(rateLimitKey)

    if (attempts === 1) {
      // Set expiry for rate limit key (1 hour)
      await redis.expire(rateLimitKey, 60 * 60)
    }

    // Limit to 5 attempts per hour
    if (attempts > 5) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      )
    }

    const json = await safeParseJson(req)
    const body = resetPasswordSchema.parse(json)

    // Find user with email - we don't want to reveal if the email exists or not
    // for security reasons, so we'll always return success
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    })

    // If user exists, generate token and send email
    if (user) {
      // Generate a secure random token
      const resetToken = generateToken(32)
      const expires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

      // Store token in database
      await prisma.verificationToken.create({
        data: {
          identifier: user.email!,
          token: resetToken,
          expires,
        },
      })

      // Only send email in production
      if (process.env.NODE_ENV === "production") {
        try {
          const transport = createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          })

          const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`

          await transport.sendMail({
            to: user.email!,
            from: process.env.SMTP_FROM || "noreply@ngdi.gov.ng",
            subject: "Reset your password",
            html: PasswordResetEmailTemplate({
              name: user.name || "User",
              resetUrl,
            }),
          })
        } catch (error) {
          console.error("Failed to send reset email:", error)
          // We still return success to the user for security reasons
        }
      } else {
        // In development, log the reset URL for easier testing
        console.log(
          "Password reset URL:",
          `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`
        )
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message:
        "If an account with that email exists, we've sent password reset instructions.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
