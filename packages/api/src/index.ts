// Import environment loader first
import "./utils/env"

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
import { serve } from "@hono/node-server"
import { config } from "./config"

// Create app instance
const app = new Hono<{
  Variables: Variables
  Bindings: Env
}>()

// Apply global middleware
app.use("*", logger())
app.use("*", cors())
app.use("*", secureHeaders())
app.use("*", prettyJSON())
app.use("*", rateLimit)
app.use("*", errorMiddleware)

// Create API router
const apiRouter = new OpenAPIHono()

// Mount routes
apiRouter.route("/auth", authRouter)
apiRouter.route("/users", userRouter)
apiRouter.route("/metadata", metadataRouter)
apiRouter.route("/search", searchRouter)
apiRouter.route("/admin", adminRouter)

// Mount API router
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

// Start the server
if (process.env.NODE_ENV !== "test") {
  const port = config.port || 3001
  console.log(`API server is running on port ${port}`)

  serve({
    fetch: app.fetch,
    port,
  })
}

// Export app
export default app
