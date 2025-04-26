import { OpenAPIHono } from "@hono/zod-openapi"
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  UserRole,
} from "../../types/auth.types"
import { authRateLimit } from "../../middleware"
import { generateToken } from "../../utils/jwt"
import { compare, hash } from "bcryptjs"
import { prisma } from "../../lib/prisma"
import { ApiError } from "../../middleware/error-handler"
import { zodValidator, getValidatedData } from "../../middleware/validation"
import { z } from "zod"
import { Context } from "hono"

// Create auth router
const auth = new OpenAPIHono()

// Apply rate limiting to all auth routes
auth.use("*", authRateLimit)

// Define response schemas
const tokenResponse = z.object({
  token: z.string(),
})

const errorResponse = z.object({
  message: z.string(),
})

const messageResponse = z.object({
  message: z.string(),
})

// Login route - using regular Hono route instead of OpenAPI
auth.post("/login", async (c: Context) => {
  try {
    const data = await c.req.json()
    const { email, password } = loginSchema.parse(data)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return c.json({ message: "Invalid credentials" }, 401)
    }

    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return c.json({ message: "Invalid credentials" }, 401)
    }

    if (!user.emailVerified || !(user.emailVerified instanceof Date)) {
      return c.json({ message: "Please verify your email first" }, 401)
    }

    const token = await generateToken({
      id: user.id,
      role: user.role as UserRole,
    })

    return c.json({ token })
  } catch (error) {
    return c.json(
      { message: error instanceof Error ? error.message : "An error occurred" },
      401
    )
  }
})

// Register route
auth.openapi(
  {
    method: "post",
    path: "/register",
    tags: ["Authentication"],
    summary: "Register new user",
    request: {
      body: {
        content: {
          "application/json": {
            schema: registerSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "User registered successfully",
        content: {
          "application/json": {
            schema: messageResponse,
          },
        },
      },
      400: {
        description: "Invalid input or email already exists",
        content: {
          "application/json": {
            schema: errorResponse,
          },
        },
      },
    },
  },
  async (c: Context) => {
    const { email, password, name } = getValidatedData<typeof registerSchema>(c)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new ApiError("Email already exists", 400)
    }

    const hashedPassword = await hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
      },
    })

    return c.json({ message: "User registered successfully" }, 201)
  }
)

// Verify email route
auth.openapi(
  {
    method: "get",
    path: "/verify-email",
    tags: ["Authentication"],
    summary: "Verify email with token",
    request: {
      query: verifyEmailSchema,
    },
    responses: {
      200: {
        description: "Email verified successfully",
        content: {
          "application/json": {
            schema: messageResponse,
          },
        },
      },
      400: {
        description: "Invalid token",
        content: {
          "application/json": {
            schema: errorResponse,
          },
        },
      },
    },
  },
  async (c: Context) => {
    const { token } = getValidatedData<typeof verifyEmailSchema>(c)

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      throw new ApiError("Invalid token", 400)
    }

    if (verificationToken.expires < new Date()) {
      throw new ApiError("Token expired", 400)
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    return c.json({ message: "Email verified successfully" })
  }
)

// Refresh token route
auth.openapi(
  {
    method: "post",
    path: "/refresh-token",
    tags: ["Authentication"],
    summary: "Refresh access token",
    request: {
      body: {
        content: {
          "application/json": {
            schema: refreshTokenSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Token refreshed successfully",
        content: {
          "application/json": {
            schema: messageResponse,
          },
        },
      },
      401: {
        description: "Invalid refresh token",
        content: {
          "application/json": {
            schema: errorResponse,
          },
        },
      },
    },
  },
  async (c: Context) => {
    // TODO: Implement refresh token logic
    return c.json({ message: "Refresh token endpoint" })
  }
)

// Forgot password route
auth.openapi(
  {
    method: "post",
    path: "/forgot-password",
    tags: ["Authentication"],
    summary: "Request password reset",
    request: {
      body: {
        content: {
          "application/json": {
            schema: forgotPasswordSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Password reset email sent",
        content: {
          "application/json": {
            schema: messageResponse,
          },
        },
      },
    },
  },
  async (c: Context) => {
    // TODO: Implement forgot password logic
    return c.json({ message: "Forgot password endpoint" })
  }
)

// Reset password route
auth.openapi(
  {
    method: "post",
    path: "/reset-password",
    tags: ["Authentication"],
    summary: "Reset password with token",
    request: {
      body: {
        content: {
          "application/json": {
            schema: resetPasswordSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Password reset successful",
        content: {
          "application/json": {
            schema: messageResponse,
          },
        },
      },
      400: {
        description: "Invalid token",
        content: {
          "application/json": {
            schema: errorResponse,
          },
        },
      },
    },
  },
  async (c: Context) => {
    // TODO: Implement reset password logic
    return c.json({ message: "Reset password endpoint" })
  }
)

export default auth
