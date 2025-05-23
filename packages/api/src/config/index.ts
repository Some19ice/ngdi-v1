import { config as envConfig } from "./env"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

/**
 * Application configuration
 */
export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001", 10),

  // Application info
  appName: process.env.APP_NAME || "NGDI Portal API",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // Rate limiting configuration
  rateLimit: {
    // General API rate limit
    standard: {
      window: parseInt(process.env.RATE_LIMIT_WINDOW || "60000", 10), // 1 minute in milliseconds
      max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10), // 100 requests per minute
    },
    // Auth endpoints rate limit (stricter)
    auth: {
      window: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || "60000", 10), // 1 minute in milliseconds
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "10", 10), // 10 requests per minute
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your-default-secret-for-dev-only",
    refreshSecret:
      process.env.REFRESH_TOKEN_SECRET ||
      process.env.JWT_SECRET ||
      "your-default-secret-for-dev-only",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    issuer: process.env.JWT_ISSUER || "ngdi-portal-api",
    audience: process.env.JWT_AUDIENCE || "ngdi-portal-client",
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-ID",
      "X-Client-Version",
      "X-Client-Platform",
    ],
    credentials: true, // Allow cookies to be sent with requests
  },

  // Database configuration
  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/myapp",
  },

  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },

  server: {
    host: process.env.HOST || "localhost",
    nodeEnv: process.env.NODE_ENV || "development",
  },
  db: {
    directUrl: process.env.DIRECT_URL,
  },
  corsOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],
  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || "noreply@example.com",
  },
  logLevel: process.env.LOG_LEVEL || "info",
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    token: process.env.REDIS_TOKEN || "",
  },
}
