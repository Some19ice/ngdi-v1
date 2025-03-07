import dotenv from "dotenv"
import { z } from "zod"

// Load environment variables from .env file
dotenv.config()

// Define schema for environment variables
const envSchema = z.object({
  // Server
  PORT: z.string().optional().default("3001"),
  HOST: z.string().optional().default("localhost"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),

  // Database
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().optional().default("1d"),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().optional().default("7d"),

  // CORS
  ALLOWED_ORIGINS: z.string(),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().optional().default("60000"),
  RATE_LIMIT_MAX: z.string().optional().default("100"),
  AUTH_RATE_LIMIT_WINDOW: z.string().optional().default("60000"),
  AUTH_RATE_LIMIT_MAX: z.string().optional().default("10"),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  EMAIL_FROM: z.string(),
})

// Parse environment variables
export const config = envSchema.parse(process.env)
