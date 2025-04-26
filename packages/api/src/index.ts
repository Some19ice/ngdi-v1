import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { prettyJSON } from "hono/pretty-json"
import { OpenAPIHono } from "@hono/zod-openapi"
import { swaggerUI } from "@hono/swagger-ui"
import authRouter from "./routes/auth.routes"
import userRouter from "./routes/user.routes"
import metadataRouter from "./routes/metadata.routes"
import searchRouter from "./routes/search.routes"
import adminRouter from "./routes/admin.routes"
import permissionsRouter from "./routes/permissions"
import rolesRouter from "./routes/roles"
import userPermissionsRouter from "./routes/user-permissions"
import permissionGroupsRouter from "./routes/permission-groups"
import activityLogsRouter from "./routes/activity-logs"
import { Context, Variables } from "./types/hono.types"
import { Env } from "hono"
import { errorMiddleware } from "./middleware/error-handler"
import { rateLimit } from "./middleware/rate-limit"
import csrf from "./middleware/csrf"
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
app.use("*", logger())
app.use(
  "*",
  cors({
    origin: config.cors.origin,
    allowMethods: config.cors.methods,
    allowHeaders: config.cors.allowedHeaders,
    exposeHeaders: ["Content-Length", "X-Request-ID"],
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

// Mount routes
apiRouter.route("/auth", authRouter)
apiRouter.route("/users", userRouter)
apiRouter.route("/metadata", metadataRouter)
apiRouter.route("/search", searchRouter)
apiRouter.route("/admin", adminRouter)

// Mount permission system routes
apiRouter.route("/permissions", permissionsRouter)
apiRouter.route("/roles", rolesRouter)
apiRouter.route("/user-permissions", userPermissionsRouter)
apiRouter.route("/permission-groups", permissionGroupsRouter)
apiRouter.route("/activity-logs", activityLogsRouter)

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
  const port = config.port || 3001

  // Start the server even if there are database connection issues
  try {
    console.log(`API server is running on port ${port}`)

    serve({
      fetch: app.fetch,
      port,
    })

    console.log("API: Server startup complete - ready to accept connections")
  } catch (error) {
    console.error("Failed to start server:", error)
  }
}

// Export app for use in Vercel serverless functions and other environments
export default app
