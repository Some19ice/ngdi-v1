import { cors } from "hono/cors"
import { config } from "../config"

/**
 * CORS configuration for the API
 */
export const corsOptions = {
  origin: (origin: string | undefined) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return true

    // Check if the origin is in the allowed list
    return (
      config.corsOrigins.includes(origin) || config.corsOrigins.includes("*")
    )
  },
  credentials: true,
  allowMethods: config.cors.methods,
  allowHeaders: config.cors.allowedHeaders,
  exposeHeaders: ["Content-Length", "X-CSRF-Token"],
  maxAge: 86400, // 24 hours
}
