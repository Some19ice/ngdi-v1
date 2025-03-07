// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Supported image types
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

/**
 * POST /api/user/profile/image - Upload profile image
 */
export async function POST(req: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the request is multipart/form-data
    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content type must be multipart/form-data" },
        { status: 400 }
      )
    }

    // Parse the form data
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 5MB limit" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported types: JPEG, PNG, GIF, WebP" },
        { status: 400 }
      )
    }

    // In a real implementation, you would upload the file to a storage service
    // like AWS S3, Cloudinary, or Supabase Storage
    // For this example, we'll simulate a successful upload with a fake URL

    // Generate a fake URL for demonstration purposes
    const timestamp = Date.now()
    const fileName = `${session.user.id}_${timestamp}_${file.name.replace(
      /\s+/g,
      "_"
    )}`
    const imageUrl = `/uploads/${fileName}`

    // Update the user's profile image in the database
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        image: imageUrl,
      },
    })

    // Revalidate the profile cache
    revalidateTag("profile")

    // Return the image URL
    return NextResponse.json({
      url: imageUrl,
      message: "Profile image updated successfully",
    })
  } catch (error) {
    console.error("Profile image upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
