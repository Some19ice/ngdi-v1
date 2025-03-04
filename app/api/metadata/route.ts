// Mark this route as dynamic to prevent static optimization attempts
export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { z } from "zod"
import { authOptions } from "@/app/api/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

const metadataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  organization: z.string().min(1, "Organization is required"),
  dateFrom: z.string().min(1, "Start date is required"),
  dateTo: z.string().min(1, "End date is required"),
  abstract: z.string().min(1, "Abstract is required"),
  purpose: z.string().min(1, "Purpose is required"),
  thumbnailUrl: z.string().url("Must be a valid URL"),
  imageName: z.string().min(1, "Image name is required"),
  frameworkType: z.string().min(1, "Framework type is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),

  // Technical Details
  coordinateSystem: z.string().min(1, "Coordinate system is required"),
  projection: z.string().min(1, "Projection is required"),
  scale: z.number().positive("Scale must be positive"),
  resolution: z.string().optional(),
  accuracyLevel: z.string().min(1, "Accuracy level is required"),
  completeness: z.number().min(0).max(100).optional(),
  consistencyCheck: z.boolean().optional(),
  validationStatus: z.string().optional(),
  fileFormat: z.string().min(1, "File format is required"),
  fileSize: z.number().positive().optional(),
  numFeatures: z.number().int().positive().optional(),
  softwareReqs: z.string().optional(),
  updateCycle: z.string().optional(),
  lastUpdate: z.string().optional(),
  nextUpdate: z.string().optional(),

  // Access Information
  distributionFormat: z.string().min(1, "Distribution format is required"),
  accessMethod: z.string().min(1, "Access method is required"),
  downloadUrl: z.string().url().optional(),
  apiEndpoint: z.string().url().optional(),
  licenseType: z.string().min(1, "License type is required"),
  usageTerms: z.string().min(1, "Usage terms are required"),
  attributionRequirements: z
    .string()
    .min(1, "Attribution requirements are required"),
  accessRestrictions: z
    .array(z.string())
    .min(1, "Select at least one access restriction"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category")
    const organization = searchParams.get("organization")
    const frameworkType = searchParams.get("frameworkType")

    const where: Prisma.MetadataWhereInput = {
      AND: [
        search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  abstract: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},
        category ? { categories: { has: category } } : {},
        organization ? { organization } : {},
        frameworkType ? { frameworkType } : {},
      ],
    }

    const [total, items] = await Promise.all([
      prisma.metadata.count({ where }),
      prisma.metadata.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              organization: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error in GET /api/metadata:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const body = metadataSchema.parse(json)

    const metadata = await prisma.metadata.create({
      data: {
        ...body,
        userId: session.user.id,
      },
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

    return NextResponse.json(metadata)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error in POST /api/metadata:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
