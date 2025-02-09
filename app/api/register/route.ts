import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organization: z.string().min(1, "Organization is required"),
  department: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = registerSchema.parse(json)

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

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: await hash(body.password, 10),
        organization: body.organization,
        department: body.department,
        phone: body.phone,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organization: user.organization,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
