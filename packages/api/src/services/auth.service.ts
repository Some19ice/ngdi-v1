import { prisma } from "../lib/prisma"
import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { HTTPException } from "hono/http-exception"
import { User, UserRole } from "@prisma/client"
import { generateToken, TokenPayload } from "../utils/auth.utils"
import { ApiError, ErrorCode } from "../middleware/error-handler"
import { AuthError, AuthErrorCode } from "../types/error.types"
import {
  generateRefreshToken,
  JwtPayload,
  verifyRefreshToken,
} from "../utils/jwt"
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserRole as AppUserRole,
} from "../types/auth.types"
import { randomUUID } from "crypto"
import { mapPrismaRoleToAppRole } from "../utils/role-mapper"
import { emailService } from "../services/email.service"
import { generateToken as createJwtToken, verifyToken } from "../utils/jwt"

export interface AuthResult {
  success: boolean
  token?: string
  error?: string
}

export class AuthService {
  constructor() {}

  private static generateToken(user: User): string {
    return sign(
      {
        userId: user.id,
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    )
  }

  private static async validatePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return compare(password, hashedPassword)
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    console.log("AuthService.login called with email:", data.email)

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    console.log("User found:", user ? "Yes" : "No")

    if (!user) {
      console.log("User not found, throwing 401")
      throw new HTTPException(401, { message: "Invalid credentials" })
    }

    console.log("Validating password")
    const isValidPassword = await this.validatePassword(
      data.password,
      user.password
    )

    console.log("Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("Invalid password, throwing 401")
      throw new HTTPException(401, { message: "Invalid credentials" })
    }

    console.log("Generating tokens")
    const accessToken = this.generateToken(user)
    const refreshToken = await generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: mapPrismaRoleToAppRole(user.role),
    })
    const { password: _, ...userWithoutPassword } = user

    console.log("Login successful, returning response")
    return {
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role),
        organization: user.organization || undefined,
        department: user.department || undefined,
      },
      accessToken,
      refreshToken,
    }
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new HTTPException(400, { message: "Email already registered" })
    }

    const hashedPassword = await hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: UserRole.USER,
        organization: data.organization,
        department: data.department,
        phone: data.phone,
      },
    })

    const accessToken = this.generateToken(user)
    const refreshToken = await generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: mapPrismaRoleToAppRole(user.role),
    })
    const { password: _, ...userWithoutPassword } = user

    return {
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role),
        organization: user.organization || undefined,
        department: user.department || undefined,
      },
      accessToken,
      refreshToken,
    }
  }

  static async validateToken(token: string): Promise<User> {
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as {
        userId: string
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user) {
        throw new HTTPException(401, { message: "User not found" })
      }

      return user
    } catch (error) {
      throw new HTTPException(401, { message: "Invalid token" })
    }
  }

  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: token },
      })

      if (!user) {
        return { success: false, error: "Invalid verification token" }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })

      return { success: true }
    } catch (error) {
      console.error("Email verification error:", error)
      return { success: false, error: "Email verification failed" }
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const jwtPayload = await verifyRefreshToken(refreshToken)
      const tokenPayload: JwtPayload = {
        userId: jwtPayload.userId,
        email: jwtPayload.email,
        role: jwtPayload.role,
      }
      const accessToken = await createJwtToken(tokenPayload)
      const newRefreshToken = await generateRefreshToken(jwtPayload)
      return { success: true, token: accessToken }
    } catch (error) {
      console.error("Refresh token error:", error)
      return { success: false, error: "Refresh token failed" }
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal that the user doesn't exist
      return
    }

    const token = randomUUID()
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, token)
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Invalid or expired token",
        400
      )
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      throw new AuthError(AuthErrorCode.TOKEN_EXPIRED, "Token has expired", 400)
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })
  }

  static async verifyEmail(token: string): Promise<void> {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    })

    if (!verificationToken) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Invalid or expired token",
        400
      )
    }

    // Update user
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    // Delete verification token
    await prisma.verificationToken.delete({
      where: { token },
    })
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal that the user doesn't exist
      return
    }

    const token = randomUUID()
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, token)
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Invalid or expired token",
        400
      )
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      throw new AuthError(AuthErrorCode.TOKEN_EXPIRED, "Token has expired", 400)
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })
  }
}

export const authService = new AuthService()
