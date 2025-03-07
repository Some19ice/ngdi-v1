import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { config } from "../config"
import { UserRole } from "../types/auth.types"

const textEncoder = new TextEncoder()
const jwtSecret = textEncoder.encode(config.jwt.secret)

export interface TokenPayload {
  id: string
  role: UserRole
  [key: string]: unknown
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(payload: TokenPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(jwtSecret)

  return token
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    return payload as TokenPayload
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export function extractTokenFromHeader(header: string): string {
  const [type, token] = header.split(" ")
  if (type !== "Bearer") {
    throw new Error("Invalid token type")
  }
  return token
}
