import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { user } from "./routes/user.routes"
import { metadata } from "./routes/metadata.routes"
import { rateLimiter } from "./middleware/rate-limit"
import type { Context } from "hono"

const app = new Hono()

// Middleware
app.use("*", logger())
app.use("*", prettyJSON())
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Total-Count"],
    maxAge: 86400,
    credentials: true,
  })
)
app.use("*", rateLimiter)

// Routes
app.route("/api/users", user)
app.route("/api/metadata", metadata)

// Health check
app.get("/health", (c: Context) => c.json({ status: "ok" }))

export default app
