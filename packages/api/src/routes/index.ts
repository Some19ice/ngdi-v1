import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { secureHeaders } from "hono/secure-headers"
import { ApiError } from "../middleware/error-handler"
import { standardRateLimit, authRateLimit } from "../middleware/rate-limit"
import { config } from "../config"
import auth from "./auth/index"
import { userRouter, adminRouter } from "./user.routes.new"
import { app as api } from "../config/swagger"
import { z } from "zod"
import { Hono } from "hono"
import { userRoutes } from "./user.routes"
import { authRoutes } from "./auth.routes"
import { metadataRoutes } from "./metadata.routes"
import { adminRoutes } from "./admin.routes"
import { rateLimit } from "../middleware/rate-limit.middleware"
import { errorHandler } from "../middleware/error-handler.middleware"
import searchRouter from "./search.routes"

// Global middlewares
api.use("*", logger())
api.use("*", prettyJSON())
api.use("*", secureHeaders())

// Apply CORS
api.use(
  "*",
  cors({
    origin: config.corsOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
)

// Apply rate limiting
api.use("*", standardRateLimit)
api.use("/auth/*", authRateLimit)

// Set up error handling
api.onError((err, c) => {
  console.error("API Error:", err)

  if (err instanceof ApiError) {
    return c.json(
      {
        success: false,
        message: err.message,
        errors: err.errors,
      },
      err.status as any
    )
  }

  // Handle other errors
  const status =
    err &&
    typeof err === "object" &&
    "status" in err &&
    typeof err.status === "number"
      ? (err.status as any)
      : 500

  return c.json(
    {
      success: false,
      message: err.message || "Internal Server Error",
    },
    status
  )
})

// Register routes
api.route("/auth", auth)
api.route("/users", userRouter)
api.route("/admin/users", adminRouter)
api.route("/metadata", metadataRoutes)
api.route("/admin", adminRoutes)
api.route("/search", searchRouter)

// Health check route
const healthCheckResponse = z.object({
  success: z.boolean(),
  message: z.string(),
})

api.openapi(
  {
    method: "get",
    path: "/",
    tags: ["System"],
    summary: "Health Check",
    description: "Check if the backend is running",
    responses: {
      200: {
        description: "Backend is running",
        content: {
          "application/json": {
            schema: healthCheckResponse,
          },
        },
      },
    },
  },
  (c) =>
    c.json({
      success: true,
      message: "Backend is running",
    })
)

// Create the main Hono app
const app = new Hono()

// Apply global middleware
app.use("*", cors())
app.use("*", logger())
app.use("*", prettyJSON())
app.use("*", secureHeaders())
app.use("*", rateLimit())
app.use("*", errorHandler())

// Health check endpoint
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "NGDI API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

// Mount the routes
app.route("/auth", authRoutes)
app.route("/users", userRoutes)
app.route("/metadata", metadataRoutes)
app.route("/admin", adminRoutes)
app.route("/search", searchRouter)

// Add a route for /search/metadata that maps to /metadata/search
app.get("/search/metadata", async (c) => {
  // Forward the request to /metadata/search
  const url = new URL(c.req.url)
  const searchParams = url.searchParams

  // Create a new URL for the internal endpoint
  const internalUrl = new URL(url.origin)
  internalUrl.pathname = "/metadata/search"

  // Copy all search parameters
  searchParams.forEach((value, key) => {
    internalUrl.searchParams.append(key, value)
  })

  // Forward the request
  const response = await fetch(internalUrl.toString(), {
    method: "GET",
    headers: c.req.headers,
  })

  // Return the response
  const data = await response.json()
  return c.json(data)
})

export default app
