import { PrismaClient, User, UserRole } from "@prisma/client"
import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenPayload,
} from "../types/auth"
import { prisma } from "../lib/prisma"

export class AuthService {
  private static generateToken(user: User): string {
    return sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    )
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error("Invalid credentials")
    }

    const isPasswordValid = await compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new Error("Invalid credentials")
    }

    const token = this.generateToken(user)
    const { password: _, ...userWithoutPassword } = user

    return {
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
    }
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error("Email already registered")
    }

    const hashedPassword = await hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: UserRole.USER,
      },
    })

    const token = this.generateToken(user)
    const { password: _, ...userWithoutPassword } = user

    return {
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
    }
  }

  static async verifyToken(token: string): Promise<TokenPayload> {
    try {
      return verify(token, process.env.JWT_SECRET || "secret") as TokenPayload
    } catch (error) {
      throw new Error("Invalid token")
    }
  }
}

export const authService = new AuthService()
