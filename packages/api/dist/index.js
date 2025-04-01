"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const logger_1 = require("hono/logger");
const secure_headers_1 = require("hono/secure-headers");
const pretty_json_1 = require("hono/pretty-json");
const zod_openapi_1 = require("@hono/zod-openapi");
const swagger_ui_1 = require("@hono/swagger-ui");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const metadata_routes_1 = __importDefault(require("./routes/metadata.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const error_handler_1 = require("./middleware/error-handler");
const rate_limit_1 = require("./middleware/rate-limit");
const csrf_1 = __importDefault(require("./middleware/csrf"));
const node_server_1 = require("@hono/node-server");
const config_1 = require("./config");
// Create app instance
const app = new hono_1.Hono();
// Apply global middleware
app.use("*", (0, logger_1.logger)());
app.use("*", (0, cors_1.cors)());
app.use("*", (0, secure_headers_1.secureHeaders)({
    contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your needs
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: [
            "'self'",
            process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
        ],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
    },
}));
app.use("*", (0, pretty_json_1.prettyJSON)());
app.use("*", rate_limit_1.rateLimit);
app.use("*", error_handler_1.errorMiddleware);
// Apply CSRF protection to all non-GET routes
app.use("*", (0, csrf_1.default)());
// Create API router
const apiRouter = new zod_openapi_1.OpenAPIHono();
// Mount routes
apiRouter.route("/auth", auth_routes_1.default);
apiRouter.route("/users", user_routes_1.default);
apiRouter.route("/metadata", metadata_routes_1.default);
apiRouter.route("/search", search_routes_1.default);
apiRouter.route("/admin", admin_routes_1.default);
// Mount API router
app.route("/api", apiRouter);
// Swagger UI
app.get("/docs/*", (0, swagger_ui_1.swaggerUI)({
    url: "/api/docs",
}));
// Add a health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));
// Start the server
if (process.env.NODE_ENV !== "test") {
    const port = config_1.config.port || 3001;
    console.log(`API server is running on port ${port}`);
    (0, node_server_1.serve)({
        fetch: app.fetch,
        port,
    });
}
// Export app
exports.default = app;
