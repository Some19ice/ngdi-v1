"use server"

import { z } from "zod"
import { revalidatePath, revalidateTag } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth-options"
import { prisma } from "@/lib/prisma"
import {
  ProfileFormValues,
  profileFormSchema,
} from "@/components/profile/types"

export async function updateUserProfile(values: Partial<ProfileFormValues>) {
  try {
    // 1. Get the user session to ensure they're authenticated
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to update your profile",
      }
    }

    // 2. Validate the provided data
    const validationSchema = profileFormSchema.partial().omit({ email: true }) // Email cannot be changed

    const result = validationSchema.safeParse(values)

    if (!result.success) {
      return {
        success: false,
        error: result.error.message || "Invalid profile data",
      }
    }

    // 3. Extract the validated data
    const validatedData = result.data

    // 4. Update fields that are in the user table
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

    // 5. Update the user record
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
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

    // 6. Store additional fields in a separate table if needed (not implemented yet)
    // This would be the place to store bio, location, socialLinks, preferences
    // For now, we'll just mock this

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
