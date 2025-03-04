import dotenv from "dotenv"
import { z } from "zod"

// Load environment variables
dotenv.config()

// Define environment variable schema
const envSchema = z.object({
  // Server
  PORT: z.string().default("3001"),
  HOST: z.string().default("localhost"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("1d"),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),

  // CORS
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().default("60000"),
  RATE_LIMIT_MAX: z.string().default("100"),
  AUTH_RATE_LIMIT_WINDOW: z.string().default("60000"),
  AUTH_RATE_LIMIT_MAX: z.string().default("10"),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
})

// Parse and validate environment variables
const env = envSchema.parse(process.env)

// Export typed configuration
export const config = {
  server: {
    port: parseInt(env.PORT, 10),
    host: env.HOST,
    environment: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  },
  database: {
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },
  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(","),
  },
  rateLimit: {
    window: parseInt(env.RATE_LIMIT_WINDOW, 10),
    max: parseInt(env.RATE_LIMIT_MAX, 10),
    auth: {
      window: parseInt(env.AUTH_RATE_LIMIT_WINDOW, 10),
      max: parseInt(env.AUTH_RATE_LIMIT_MAX, 10),
    },
  },
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : undefined,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.EMAIL_FROM,
  },
}
