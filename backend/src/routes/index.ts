import { Hono } from "hono"
import { OpenAPIHono } from "@hono/swagger-ui"
import authRoutes from "./auth"
import userRoutes from "./user"
import metadataRoutes from "./metadata"
import adminRoutes from "./admin"
import { errorMiddleware } from "../middleware/error-handler"

// Create API router
const api = new OpenAPIHono({
  openapi: {
    info: {
      title: "NGDI Portal API",
      version: "1.0.0",
      description: "API for the NGDI Portal",
    },
    servers: [
      {
        url: "http://localhost:3001/api",
        description: "Development server",
      },
    ],
  },
})

// Apply global middleware
api.use("*", errorMiddleware)

// Register routes
api.route("/auth", authRoutes)
api.route("/user", userRoutes)
api.route("/metadata", metadataRoutes)
api.route("/admin", adminRoutes)

// Swagger JSON endpoint
api.doc("/swagger.json", {
  openapi: "3.0.0",
  info: {
    title: "NGDI Portal API",
    version: "1.0.0",
    description: "API for the NGDI Portal",
  },
  servers: [
    {
      url: "http://localhost:3001/api",
      description: "Development server",
    },
  ],
})

export default api
