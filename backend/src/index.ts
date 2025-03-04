import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import { compress } from "hono/compress"
import { swaggerUI } from "@hono/swagger-ui"
import { prettyJSON } from "hono/pretty-json"
import { config } from "./config/env"
import { errorHandler } from "./middleware/error-handler"
import routes from "./routes"

// Create Hono app
const app = new Hono()

// Apply global middleware
app.use("*", logger())
app.use("*", prettyJSON())
app.use("*", compress())
app.use("*", secureHeaders())
app.use(
  "*",
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
)

// Apply error handler
app.onError(errorHandler)

// Health check endpoint
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
)

// Register API routes
app.route("/api", routes)

// Swagger documentation
app.get("/docs/*", swaggerUI({ url: "/api/swagger.json" }))

// Start server
const port = config.server.port
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})

export default app
