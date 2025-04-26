"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { validateJwtToken } from "@/lib/auth-client"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// Get the current user ID from auth token
async function getCurrentUserId(): Promise<string | null> {
  const authToken = cookies().get("auth_token")?.value

  if (!authToken) {
    return null
  }

  try {
    const validationResult = await validateJwtToken(authToken)

    if (!validationResult.isValid) {
      return null
    }

    return validationResult.userId || null
  } catch (error) {
    return null
  }
}

// Schema for draft data
const draftSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  data: z.record(z.any()),
  lastUpdated: z.string().optional(),
})

type DraftData = z.infer<typeof draftSchema>

/**
 * Save form draft to the server
 */
export async function saveDraft(data: DraftData) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate the data
    const validatedData = draftSchema.parse(data)

    // Set defaults
    const title = validatedData.title || "Untitled Draft"
    const lastUpdated = validatedData.lastUpdated || new Date().toISOString()

    // Save to database
    if (validatedData.id) {
      // Update existing draft
      const draft = await prisma.draft.update({
        where: {
          id: validatedData.id,
          userId,
        },
        data: {
          title,
          data: validatedData.data,
          lastUpdated,
        },
      })

      return { success: true, draft }
    } else {
      // Create new draft
      const draft = await prisma.draft.create({
        data: {
          userId,
          title,
          data: validatedData.data,
          lastUpdated,
        },
      })

      return { success: true, draft }
    }
  } catch (error) {
    console.error("Error saving draft:", error)
    return { success: false, error: "Failed to save draft" }
  }
}

/**
 * Get all drafts for the current user
 */
export async function getUserDrafts() {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    const drafts = await prisma.draft.findMany({
      where: { userId },
      orderBy: { lastUpdated: "desc" },
      select: {
        id: true,
        title: true,
        lastUpdated: true,
        createdAt: true,
      },
    })

    return { success: true, drafts }
  } catch (error) {
    console.error("Error fetching drafts:", error)
    return { success: false, error: "Failed to fetch drafts" }
  }
}

/**
 * Get a specific draft by ID
 */
export async function getDraft(id: string) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    const draft = await prisma.draft.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!draft) {
      return { success: false, error: "Draft not found" }
    }

    return { success: true, draft }
  } catch (error) {
    console.error("Error fetching draft:", error)
    return { success: false, error: "Failed to fetch draft" }
  }
}

/**
 * Delete a draft
 */
export async function deleteDraft(id: string) {
  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.draft.delete({
      where: {
        id,
        userId,
      },
    })

    revalidatePath("/metadata/drafts")
    return { success: true }
  } catch (error) {
    console.error("Error deleting draft:", error)
    return { success: false, error: "Failed to delete draft" }
  }
}
