import { SignJWT, jwtVerify } from "jose"
import { config } from "../config/env"

// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder()
const jwtSecret = textEncoder.encode(config.jwt.secret)
const refreshSecret = textEncoder.encode(config.jwt.refreshSecret)

/**
 * JWT payload interface
 */
export interface JwtPayload {
  id: string
  email: string
  role: string
  [key: string]: unknown
}

/**
 * Generate a JWT token
 */
export async function generateToken(
  payload: JwtPayload,
  expiresIn = config.jwt.expiresIn
): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(jwtSecret)

  return token
}

/**
 * Generate a refresh token
 */
export async function generateRefreshToken(
  payload: JwtPayload,
  expiresIn = config.jwt.refreshExpiresIn
): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(refreshSecret)

  return token
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    return payload as unknown as JwtPayload
  } catch (error) {
    throw new Error("Invalid token")
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret)
    return payload as unknown as JwtPayload
  } catch (error) {
    throw new Error("Invalid refresh token")
  }
}
