import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { secureHeaders } from "hono/secure-headers"
import { ApiError } from "../middleware/error-handler"
import { standardRateLimit, authRateLimit } from "../middleware/rate-limit"
import { config } from "../config"
import auth from "./auth/index"
import { userRouter } from "./user.routes.new"
import { app as api } from "../config/swagger"
import { z } from "zod"
import adminRouter from "./admin.routes"
import metadataRouter from "./metadata.routes"
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
api.route("/metadata", metadataRouter)
api.route("/admin", adminRouter)
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
  (c) => {
    return c.json({
      success: true,
      message: "API is running",
    })
  }
)

export default api
