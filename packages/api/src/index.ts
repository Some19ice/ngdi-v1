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

// Apply global middleware
app.use("*", logger())
app.use(
  "*",
  cors({
    origin: ["https://ngdi-v1.vercel.app", "http://localhost:3000"],
    credentials: true, // Important for cookies
    exposeHeaders: ["Content-Length", "X-CSRF-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-Client-Version",
      "X-Client-Platform",
      "X-Request-ID",
      "Cookie",
    ],
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

// Add a health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }))

// Start the server in non-production environments
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  const port = config.port || 3001
  console.log(`API server is running on port ${port}`)

  serve({
    fetch: app.fetch,
    port,
  })
}

// Export app for use in Vercel serverless functions and other environments
export default app
