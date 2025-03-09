import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { UserRole, isValidRole } from "@/lib/auth/constants"
import { validateJwtToken } from "@/lib/auth-client"
import { cookies } from "next/headers"

const prisma = new PrismaClient()

// Schema for admin user creation
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([UserRole.ADMIN, UserRole.NODE_OFFICER, UserRole.USER]),
  organization: z.string().min(2, "Organization must be at least 2 characters"),
  department: z.string().optional(),
})

// GET endpoint for fetching users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token" },
        { status: 401 }
      )
    }

    // Validate token and get user info
    const validation = await validateJwtToken(token)
    console.log("Token validation:", validation)

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      )
    }

    if (validation.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Only administrators can view user list",
        },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || undefined

    console.log("Query params:", { page, limit, search, role })

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
      ]
    }

    // Add role filter
    if (role && role !== "all") {
      where.role = role
    }

    console.log("Prisma where clause:", where)

    // Get total count for pagination
    const total = await prisma.user.count({ where })
    console.log("Total users:", total)

    // Fetch users with pagination and filtering
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    console.log("Found users:", users.length)

    // Calculate total pages
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST endpoint for creating users
export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token" },
        { status: 401 }
      )
    }

    // Validate token and get user info
    const validation = await validateJwtToken(token)
    console.log("Token validation:", validation)

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      )
    }

    if (validation.role !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          message: "Only administrators can create admin users",
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    const { name, email, password, role, organization, department } =
      validationResult.data

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        organization,
        department,
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
