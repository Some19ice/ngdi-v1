"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = require("hono/cors");
const logger_1 = require("hono/logger");
const pretty_json_1 = require("hono/pretty-json");
const secure_headers_1 = require("hono/secure-headers");
const error_handler_1 = require("../middleware/error-handler");
const rate_limit_1 = require("../middleware/rate-limit");
const config_1 = require("../config");
const index_1 = __importDefault(require("./auth/index"));
const user_routes_new_1 = require("./user.routes.new");
const swagger_1 = require("../config/swagger");
const zod_1 = require("zod");
const hono_1 = require("hono");
const user_routes_1 = require("./user.routes");
const auth_routes_1 = require("./auth.routes");
const metadata_routes_1 = require("./metadata.routes");
const admin_routes_1 = require("./admin.routes");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
const search_routes_1 = __importDefault(require("./search.routes"));
// Global middlewares
swagger_1.app.use("*", (0, logger_1.logger)());
swagger_1.app.use("*", (0, pretty_json_1.prettyJSON)());
swagger_1.app.use("*", (0, secure_headers_1.secureHeaders)());
// Apply CORS
swagger_1.app.use("*", (0, cors_1.cors)({
    origin: config_1.config.corsOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
// Apply rate limiting
swagger_1.app.use("*", rate_limit_1.standardRateLimit);
swagger_1.app.use("/auth/*", rate_limit_1.authRateLimit);
// Set up error handling
swagger_1.app.onError((err, c) => {
    console.error("API Error:", err);
    if (err instanceof error_handler_1.ApiError) {
        return c.json({
            success: false,
            message: err.message,
            errors: err.errors,
        }, err.status);
    }
    // Handle other errors
    const status = err &&
        typeof err === "object" &&
        "status" in err &&
        typeof err.status === "number"
        ? err.status
        : 500;
    return c.json({
        success: false,
        message: err.message || "Internal Server Error",
    }, status);
});
// Register routes
swagger_1.app.route("/auth", index_1.default);
swagger_1.app.route("/users", user_routes_new_1.userRouter);
swagger_1.app.route("/admin/users", user_routes_new_1.adminRouter);
swagger_1.app.route("/metadata", metadata_routes_1.metadataRoutes);
swagger_1.app.route("/admin", admin_routes_1.adminRoutes);
swagger_1.app.route("/search", search_routes_1.default);
// Health check route
const healthCheckResponse = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string(),
});
swagger_1.app.openapi({
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
}, (c) => c.json({
    success: true,
    message: "Backend is running",
}));
// Create the main Hono app
const app = new hono_1.Hono();
// Apply global middleware
app.use("*", (0, cors_1.cors)());
app.use("*", (0, logger_1.logger)());
app.use("*", (0, pretty_json_1.prettyJSON)());
app.use("*", (0, secure_headers_1.secureHeaders)());
app.use("*", (0, rate_limit_middleware_1.rateLimit)());
app.use("*", (0, error_handler_middleware_1.errorHandler)());
// Health check endpoint
app.get("/", (c) => {
    return c.json({
        status: "ok",
        message: "NGDI API is running",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});
// Mount the routes
app.route("/auth", auth_routes_1.authRoutes);
app.route("/users", user_routes_1.userRoutes);
app.route("/metadata", metadata_routes_1.metadataRoutes);
app.route("/admin", admin_routes_1.adminRoutes);
app.route("/search", search_routes_1.default);
// Add a route for /search/metadata that maps to /metadata/search
app.get("/search/metadata", async (c) => {
    // Forward the request to /metadata/search
    const url = new URL(c.req.url);
    const searchParams = url.searchParams;
    // Create a new URL for the internal endpoint
    const internalUrl = new URL(url.origin);
    internalUrl.pathname = "/metadata/search";
    // Copy all search parameters
    searchParams.forEach((value, key) => {
        internalUrl.searchParams.append(key, value);
    });
    // Forward the request
    const response = await fetch(internalUrl.toString(), {
        method: "GET",
        headers: c.req.headers,
    });
    // Return the response
    const data = await response.json();
    return c.json(data);
});
exports.default = app;
