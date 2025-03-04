// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/app/api/auth/auth-options"
import { prisma } from "@/lib/prisma"

const updateMetadataSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  author: z.string().min(1, "Author is required").optional(),
  organization: z.string().min(1, "Organization is required").optional(),
  dateFrom: z.string().min(1, "Start date is required").optional(),
  dateTo: z.string().min(1, "End date is required").optional(),
  abstract: z.string().min(1, "Abstract is required").optional(),
  purpose: z.string().min(1, "Purpose is required").optional(),
  thumbnailUrl: z.string().optional(),
  imageName: z.string().min(1, "Image name is required").optional(),
  frameworkType: z.string().min(1, "Framework type is required").optional(),
  categories: z
    .array(z.string())
    .min(1, "At least one category is required")
    .optional(),

  // Technical Details
  coordinateSystem: z
    .string()
    .min(1, "Coordinate system is required")
    .optional(),
  projection: z.string().min(1, "Projection is required").optional(),
  scale: z.number().positive("Scale must be positive").optional(),
  resolution: z.string().optional(),
  accuracyLevel: z.string().min(1, "Accuracy level is required").optional(),
  completeness: z.number().min(0).max(100).optional(),
  consistencyCheck: z.boolean().optional(),
  validationStatus: z.string().optional(),
  fileFormat: z.string().min(1, "File format is required").optional(),
  fileSize: z.number().positive().optional(),
  numFeatures: z.number().int().positive().optional(),
  softwareReqs: z.string().optional(),
  updateCycle: z.string().optional(),
  lastUpdate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  nextUpdate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),

  // Access Information
  distributionFormat: z
    .string()
    .min(1, "Distribution format is required")
    .optional(),
  accessMethod: z.string().min(1, "Access method is required").optional(),
  downloadUrl: z.string().url().optional(),
  apiEndpoint: z.string().url().optional(),
  licenseType: z.string().min(1, "License type is required").optional(),
  usageTerms: z.string().optional(),
  attribution: z.string().optional(),
  accessRestrictions: z.array(z.string()).optional(),
})

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const metadata = await prisma.metadata.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            organization: true,
          },
        },
      },
    })

    if (!metadata) {
      return NextResponse.json({ error: "Metadata not found" }, { status: 404 })
    }

    return NextResponse.json(metadata)
  } catch (error) {
    console.error("Error in GET /api/metadata/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const metadata = await prisma.metadata.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!metadata) {
      return NextResponse.json({ error: "Metadata not found" }, { status: 404 })
    }

    if (metadata.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const json = await req.json()
    const body = updateMetadataSchema.parse(json)

    const updated = await prisma.metadata.update({
      where: { id: params.id },
      data: body,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            organization: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error in PATCH /api/metadata/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const metadata = await prisma.metadata.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!metadata) {
      return NextResponse.json({ error: "Metadata not found" }, { status: 404 })
    }

    if (metadata.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.metadata.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error in DELETE /api/metadata/[id]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
