import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/auth-options"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/auth/types"
import { hash } from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log("Supabase sync endpoint called")

    // Get the current session
    const session = await getServerSession(authOptions)

    // If already authenticated with NextAuth, just return success
    if (session?.user) {
      console.log(
        "User already authenticated with NextAuth:",
        session.user.email
      )
      return NextResponse.json({
        success: true,
        message: "Already authenticated",
      })
    }

    // Parse the request body
    const body = await request.json()
    const { id, email, name, image, supabaseAccessToken } = body

    if (!id || !email) {
      console.error("Missing required fields:", { id, email })
      return NextResponse.json(
        { error: "Missing required user information" },
        { status: 400 }
      )
    }

    console.log("Syncing user:", { id, email, name })

    try {
      // Generate a random password for OAuth users
      const randomPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await hash(randomPassword, 12)

      // Upsert the user with a transaction to ensure consistency
      const user = await prisma.$transaction(async (tx) => {
        // Try to find the user first
        const existingUser = await tx.user.findUnique({
          where: { email },
          include: {
            accounts: {
              where: {
                provider: "supabase",
                providerAccountId: id,
              },
            },
          },
        })

        if (!existingUser) {
          console.log("Creating new user:", email)
          return await tx.user.create({
            data: {
              id,
              email,
              name: name || email.split("@")[0],
              image,
              emailVerified: new Date(),
              role: UserRole.USER,
              password: hashedPassword,
              accounts: {
                create: {
                  type: "oauth",
                  provider: "supabase",
                  providerAccountId: id,
                  access_token: supabaseAccessToken,
                },
              },
            },
            include: {
              accounts: true,
            },
          })
        }

        console.log("Updating existing user:", email)
        // Update the user and ensure the Supabase account is linked
        return await tx.user.update({
          where: { email },
          data: {
            name: name || existingUser.name,
            image: image || existingUser.image,
            emailVerified: existingUser.emailVerified || new Date(),
            accounts: {
              upsert: {
                where: {
                  provider_providerAccountId: {
                    provider: "supabase",
                    providerAccountId: id,
                  },
                },
                create: {
                  type: "oauth",
                  provider: "supabase",
                  providerAccountId: id,
                  access_token: supabaseAccessToken,
                },
                update: {
                  access_token: supabaseAccessToken,
                },
              },
            },
          },
          include: {
            accounts: true,
          },
        })
      })

      console.log("User upserted successfully:", {
        id: user.id,
        email: user.email,
        accountsCount: user.accounts.length,
      })

      // Create a custom token for NextAuth
      const customToken = Buffer.from(
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          provider: "supabase",
          accessToken: supabaseAccessToken,
        })
      ).toString("base64")

      // Return the success response with the custom token
      const response = NextResponse.json({
        success: true,
        customToken,
      })

      console.log("Session data prepared successfully")
      return response
    } catch (dbError) {
      console.error("Database error during user sync:", dbError)
      return NextResponse.json(
        { error: "Failed to synchronize user data" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in Supabase sync endpoint:", error)
    return NextResponse.json(
      { error: "Failed to synchronize session" },
      { status: 500 }
    )
  }
}
