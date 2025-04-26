import { prisma } from "../lib/prisma"
import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { HTTPException } from "hono/http-exception"
import { User, UserRole } from "@prisma/client"
import { generateToken, JwtPayload } from "../utils/jwt"
import { ApiError, ErrorCode } from "../middleware/error-handler"
import { AuthError, AuthErrorCode } from "../types/error.types"
import {
  generateRefreshToken,
  JwtPayload,
  verifyRefreshToken,
  generateJwtId,
  storeTokenFamily,
  revokeToken,
  revokeAllUserTokens,
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
import { accountLockoutService } from "./account-lockout.service"
import { securityLogService, SecurityEventType } from "./security-log.service"

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

    try {
      // Check if account is locked
      await accountLockoutService.checkAccountStatus(data.email)

      const user = await prisma.user.findUnique({
        where: { email: data.email },
      })

      console.log("User found:", user ? "Yes" : "No")

      // Get client info for security logging
      const ipAddress = data.ipAddress || "unknown"
      const userAgent = data.userAgent || "unknown"

      if (!user) {
        console.log("User not found, recording failed attempt")
        // Record failed attempt even if user doesn't exist (prevents user enumeration)
        await accountLockoutService.recordFailedAttempt(
          data.email,
          ipAddress,
          userAgent
        )

        // Log security event
        await securityLogService.logLoginFailure(
          data.email,
          ipAddress,
          userAgent,
          "User not found"
        )

        throw new HTTPException(401, { message: "Invalid credentials" })
      }

      console.log("Validating password")
      const isValidPassword = await this.validatePassword(
        data.password,
        user.password
      )

      console.log("Password valid:", isValidPassword)

      if (!isValidPassword) {
        console.log("Invalid password, recording failed attempt")
        // Record failed attempt
        await accountLockoutService.recordFailedAttempt(
          user.email,
          ipAddress,
          userAgent
        )

        // Log security event
        await securityLogService.logLoginFailure(
          user.email,
          ipAddress,
          userAgent,
          "Invalid password"
        )

        throw new HTTPException(401, { message: "Invalid credentials" })
      }

      // Reset failed attempts counter on successful login
      await accountLockoutService.resetFailedAttempts(user.email)

      // Log successful login
      await securityLogService.logLoginSuccess(
        user.id,
        user.email,
        ipAddress,
        userAgent,
        data.deviceId
      )

      console.log("Generating tokens with enhanced security")

      // Create a token family for refresh token rotation
      const tokenFamily = generateJwtId()

      // Create token payload with enhanced security
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role),
        // Add additional security claims
        jti: generateJwtId(),
      }

      // Generate access token with shorter expiration (15 minutes)
      const accessToken = await generateToken(tokenPayload, "15m", {
        includeJti: true,
      })

      // Generate refresh token with the token family
      const refreshTokenId = generateJwtId()
      const refreshToken = await generateRefreshToken(
        tokenPayload,
        "7d", // 7 days
        {
          includeJti: true,
          family: tokenFamily,
        }
      )

      // Store the token family for future validation
      await storeTokenFamily(tokenFamily, refreshTokenId)
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
    } catch (error) {
      console.error("Login error:", error)
      throw new HTTPException(500, { message: "Authentication failed" })
    }
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser) {
        throw new HTTPException(400, { message: "Email already registered" })
      }

      // Hash the password
      const hashedPassword = await hash(data.password, 10)

      // Create the user
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

      // Generate tokens with enhanced security
      // Create a token family for refresh token rotation
      const tokenFamily = generateJwtId()

      // Create token payload with enhanced security
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: mapPrismaRoleToAppRole(user.role),
        // Add additional security claims
        jti: generateJwtId(),
      }

      // Generate access token with shorter expiration (15 minutes)
      const accessToken = await generateToken(tokenPayload, "15m", {
        includeJti: true,
      })

      // Generate refresh token with the token family
      const refreshTokenId = generateJwtId()
      const refreshToken = await generateRefreshToken(
        tokenPayload,
        "7d", // 7 days
        {
          includeJti: true,
          family: tokenFamily,
        }
      )

      // Store the token family for future validation
      await storeTokenFamily(tokenFamily, refreshTokenId)

      // Remove password from response
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
    } catch (error) {
      console.error("Registration error:", error)
      if (error instanceof HTTPException) {
        throw error
      }
      throw new HTTPException(500, { message: "Registration failed" })
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
      console.error("Token validation error:", error)
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
    try {
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
    } catch (error) {
      console.error("Email verification error:", error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError(
        AuthErrorCode.VERIFICATION_FAILED,
        "Email verification failed",
        500
      )
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        // Don't reveal that the user doesn't exist
        return
      }

      // Generate token
      const token = randomUUID()
      const expires = new Date()
      expires.setHours(expires.getHours() + 1)

      // Create verification token
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      })

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(email, token)
      } catch (error) {
        console.error("Email service error:", error)
        // In development, just log the token
        if (process.env.NODE_ENV === "development") {
          console.log(`[DEV] Password reset token for ${email}: ${token}`)
        }
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      // Don't expose errors to the client for security reasons
    }
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Find verification token
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

      // Check if token is expired
      if (verificationToken.expires < new Date()) {
        await prisma.verificationToken.delete({
          where: { token },
        })
        throw new AuthError(
          AuthErrorCode.TOKEN_EXPIRED,
          "Token has expired",
          400
        )
      }

      // Hash the new password
      const hashedPassword = await hash(newPassword, 10)

      // Update user password
      await prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { password: hashedPassword },
      })

      // Delete verification token
      await prisma.verificationToken.delete({
        where: { token },
      })
    } catch (error) {
      console.error("Password reset error:", error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError(
        AuthErrorCode.RESET_PASSWORD_FAILED,
        "Failed to reset password",
        500
      )
    }
  }
}

export const authService = new AuthService()
