import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createTransport } from "nodemailer"
import { WelcomeEmailTemplate } from "@/lib/auth/email-templates"

// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return new Response("Missing verification token", { status: 400 })
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    })

    if (!verificationToken) {
      return new Response("Invalid or expired verification token", {
        status: 400,
      })
    }

    // Check if token is expired
    if (new Date() > new Date(verificationToken.expires)) {
      // Delete the expired token
      await prisma.verificationToken.delete({
        where: {
          token,
        },
      })

      return new Response("Verification token has expired", { status: 400 })
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    // Mark the user as verified
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    })

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: {
        token,
      },
    })

    // Send welcome email
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

        const loginUrl = `${process.env.NEXTAUTH_URL}/auth/signin`

        await transport.sendMail({
          to: user.email!,
          from: process.env.SMTP_FROM || "noreply@ngdi.gov.ng",
          subject: "Welcome to NGDI Portal",
          html: WelcomeEmailTemplate({
            name: user.name || "User",
            loginUrl,
          }),
        })
      } catch (error) {
        console.error("Failed to send welcome email:", error)
        // Continue anyway
      }
    }

    // Redirect to the login page with a success message
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth/signin?verified=true`
    )
  } catch (error) {
    console.error("Verification error:", error)
    return new Response("An error occurred during verification", {
      status: 500,
    })
  }
}
