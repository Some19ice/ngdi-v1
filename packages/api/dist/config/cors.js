"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const config_1 = require("../config");
/**
 * CORS configuration for the API
 */
exports.corsOptions = {
    origin: (origin) => {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin)
            return true;
        // Check if the origin is in the allowed list
        return (config_1.config.corsOrigins.includes(origin) || config_1.config.corsOrigins.includes("*"));
    },
    credentials: true,
    allowMethods: config_1.config.cors.methods,
    allowHeaders: config_1.config.cors.allowedHeaders,
    exposeHeaders: ["Content-Length", "X-CSRF-Token"],
    maxAge: 86400, // 24 hours
};
