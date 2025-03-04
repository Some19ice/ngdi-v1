// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic";

import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/auth/types"
import { passwordSchema, generateToken } from "@/lib/auth/validation"
import { createTransport } from "nodemailer"
import { EmailVerificationTemplate } from "@/lib/auth/email-templates"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  organization: z.string().min(1, "Organization is required"),
  department: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = registerSchema.parse(json)

    // Check if user already exists
    const exists = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (exists) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await hash(body.password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        organization: body.organization,
        department: body.department,
        phone: body.phone,
        role: UserRole.USER, // Default role
      },
    })

    // Create verification token
    const verificationToken = generateToken(32)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email!,
        token: verificationToken,
        expires,
      },
    })

    // Send verification email
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

        const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`

        await transport.sendMail({
          to: user.email!,
          from: process.env.SMTP_FROM || "noreply@ngdi.gov.ng",
          subject: "Verify your email address",
          html: EmailVerificationTemplate({
            name: user.name || "User",
            verificationUrl,
          }),
        })
      } catch (error) {
        console.error("Failed to send verification email:", error)
        // Continue anyway - user can request verification later
      }
    }

    // Return user data (excluding password)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organization: user.organization,
      },
      message:
        "Registration successful. Please verify your email to activate your account.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
