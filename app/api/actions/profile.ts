"use server"

import { z } from "zod"
import { revalidatePath, revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import {
  ProfileFormValues,
  profileFormSchema,
} from "@/components/profile/types"
import { verify } from "jsonwebtoken"

// Constants
const AUTH_COOKIE_NAME = "auth_token"

export async function updateUserProfile(values: Partial<ProfileFormValues>) {
  try {
    // 1. Get the user session from cookies
    const token = cookies().get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return {
        success: false,
        error: "You must be signed in to update your profile",
      }
    }

    // 2. Verify the token
    let userId: string
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return {
        success: false,
        error: "Invalid authentication token",
      }
    }

    // 3. Validate the provided data
    const validationSchema = profileFormSchema.partial().omit({ email: true }) // Email cannot be changed

    const result = validationSchema.safeParse(values)

    if (!result.success) {
      return {
        success: false,
        error: result.error.message || "Invalid profile data",
      }
    }

    // 4. Extract the validated data
    const validatedData = result.data

    // 5. Update fields that are in the user table
    const updateData: Record<string, any> = {}

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.image !== undefined)
      updateData.image = validatedData.image
    if (validatedData.organization !== undefined)
      updateData.organization = validatedData.organization
    if (validatedData.department !== undefined)
      updateData.department = validatedData.department
    if (validatedData.phone !== undefined)
      updateData.phone = validatedData.phone

    // 6. Update the user record
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    // 7. Revalidate the profile data cache
    revalidatePath("/profile")
    revalidateTag("profile")

    return {
      success: true,
      user: updatedUser,
    }
  } catch (error) {
    console.error("Profile update error:", error)

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    }
  }
}
