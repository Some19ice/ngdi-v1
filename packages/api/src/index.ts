import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger as honoLogger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { prettyJSON } from "hono/pretty-json"
import { OpenAPIHono } from "@hono/zod-openapi"
import { swaggerUI } from "@hono/swagger-ui"
// Import router implementations
import authRouter from "./routes/auth.routes"
import { userRouter } from "./routes/user.routes"
import metadataRouter from "./routes/metadata.routes"
import searchRouter from "./routes/search.routes"
import adminRouter from "./routes/admin.routes"
import dashboardStatsRouter from "./routes/admin/dashboard-stats"
import permissionsRouter from "./routes/permissions"
import rolesRouter from "./routes/roles"
import userPermissionsRouter from "./routes/user-permissions"
import permissionGroupsRouter from "./routes/permission-groups"
import activityLogsRouter from "./routes/activity-logs"
import settingsRouter from "./routes/settings.routes"
// Import centralized error handling
import { errorMiddleware } from "./services/error-handling.service"
import { Context, Variables } from "./types/hono.types"
import { Env } from "hono"
import { rateLimit } from "./middleware/rate-limit"
import csrf from "./middleware/csrf"
import { requireValidPassword } from "./middleware/password-policy.middleware"
import { serve } from "@hono/node-server"
import { config } from "./config"

// Create app instance
const app = new Hono<{
  Variables: Variables
  Bindings: Env
}>()

// Add health check endpoint BEFORE all other middleware and routes
// This ensures it's available even if other middleware has issues
app.get("/health", (c) => {
  console.log("Health check endpoint called")
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "development",
  })
})

app.get("/api/health", (c) => {
  console.log("Health check endpoint called via /api/health")
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "development",
  })
})

// Now proceed with normal middleware
// Apply global middleware
app.use("*", honoLogger())
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return true

      // Always allow localhost origins for development
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return true
      }

      // Check configured origins
      return (
        config.cors.origin.includes(origin) || config.cors.origin.includes("*")
      )
    },
    allowMethods: config.cors.methods,
    allowHeaders: [
      ...config.cors.allowedHeaders,
      "Accept",
      "Content-Type",
      "Authorization",
    ],
    exposeHeaders: ["Content-Length", "X-Request-ID", "X-CSRF-Token"],
    credentials: true, // Allow cookies to be sent with requests
    maxAge: 86400, // 24 hours
  })
)
app.use("*", prettyJSON())
app.use("*", rateLimit)
app.use("*", errorMiddleware)

// Apply CSRF protection to all non-GET routes
app.use("*", csrf())

// Create API router
const apiRouter = new OpenAPIHono()

// Mount auth routes (no password policy check to allow password changes)
apiRouter.route("/auth", authRouter)

// Apply password policy middleware to all protected routes
// This will check if the user's password is expired and needs to be changed
const protectedApiRouter = new OpenAPIHono()
protectedApiRouter.use("*", requireValidPassword)

// Mount protected routes
protectedApiRouter.route("/users", userRouter)
protectedApiRouter.route("/metadata", metadataRouter)
protectedApiRouter.route("/search", searchRouter)
protectedApiRouter.route("/admin", adminRouter)
protectedApiRouter.route("/admin/dashboard-stats", dashboardStatsRouter)

// Mount permission system routes
protectedApiRouter.route("/permissions", permissionsRouter)
protectedApiRouter.route("/roles", rolesRouter)
protectedApiRouter.route("/user-permissions", userPermissionsRouter)
protectedApiRouter.route("/permission-groups", permissionGroupsRouter)
protectedApiRouter.route("/activity-logs", activityLogsRouter)

// Mount settings routes
protectedApiRouter.route("/settings", settingsRouter)

// Mount the protected router
apiRouter.route("/", protectedApiRouter)

// Mount API router
app.route("/", apiRouter)
app.route("/api", apiRouter)

// Swagger UI
app.get(
  "/docs/*",
  swaggerUI({
    url: "/api/docs",
  })
)

// Start the server in non-production environments
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  const startServer = async (initialPort: number) => {
    let port = initialPort
    let maxAttempts = 10 // Increased max attempts
    let attempts = 0

    // Define a range of ports to try
    const portRange = Array.from(
      { length: maxAttempts },
      (_, i) => initialPort + i
    )

    // First check if any ports are already in use
    console.log(`Checking available ports starting from ${initialPort}...`)

    for (const currentPort of portRange) {
      if (attempts >= maxAttempts) break

      try {
        console.log(`Attempting to start API server on port ${currentPort}`)

        // Create server with error handling
        const server = await serve({
          fetch: app.fetch,
          port: currentPort,
          onError: (err) => {
            console.error(`Server error on port ${currentPort}:`, err)
          },
        })

        // If we get here, the server started successfully
        console.log(`✅ API server is running on port ${currentPort}`)
        console.log(
          `API: Server startup complete - ready to accept connections`
        )

        // Export the port for other modules to use
        process.env.API_PORT = String(currentPort)

        // Return the server instance
        return server
      } catch (error: any) {
        attempts++

        // Check if the error is due to the port being in use
        if (error.code === "EADDRINUSE") {
          console.warn(
            `Port ${currentPort} is already in use, trying next port...`
          )
          // Continue to next port in the loop
        } else {
          // For other errors, log and try the next port
          console.error(`Failed to start server on port ${currentPort}:`, error)
          // Continue to next port in the loop
        }
      }
    }

    // If we get here, all attempts failed
    throw new Error(
      `Failed to start server after trying ${attempts} ports starting from ${initialPort}`
    )
  }

  // Start the server with the configured port and handle errors properly
  startServer(config.port || 3001)
    .then((server) => {
      // Add any post-startup tasks here
      console.log(`API server is ready to handle requests`)
    })
    .catch((error) => {
      console.error("Failed to start API server:", error)
      // Exit with error code to indicate startup failure
      process.exit(1)
    })
}

// Export app for use in Vercel serverless functions and other environments
export default app
