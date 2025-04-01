"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrf = void 0;
const cookie_1 = require("hono/cookie");
const crypto_1 = __importDefault(require("crypto"));
// Default options
const defaultOptions = {
    cookie: {
        name: "csrf_token",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
    },
    ignoreMethods: ["GET", "HEAD", "OPTIONS"], // Methods that don't need CSRF protection
    ignorePaths: ["/api/health", "/auth/login", "/auth/register"], // Paths that don't need CSRF protection
    tokenHeader: "X-CSRF-Token",
};
// Helper function to generate a CSRF token
const generateToken = () => {
    return crypto_1.default.randomBytes(16).toString("hex");
};
// CSRF middleware factory
const csrf = (options = {}) => {
    // Merge options with defaults
    const opts = {
        ...defaultOptions,
        ...options,
        cookie: {
            ...defaultOptions.cookie,
            ...options.cookie,
        },
    };
    // CSRF middleware handler
    return async (c, next) => {
        const method = c.req.method;
        const path = c.req.path;
        // Skip CSRF validation for ignored methods and paths
        if (opts.ignoreMethods?.includes(method) ||
            opts.ignorePaths?.some((p) => path.startsWith(p))) {
            // For GET requests, always ensure the token exists
            if (method === "GET") {
                let token = (0, cookie_1.getCookie)(c, opts.cookie.name);
                if (!token) {
                    token = generateToken();
                    (0, cookie_1.setCookie)(c, opts.cookie.name, token, opts.cookie);
                }
            }
            await next();
            return;
        }
        // Get the token from the cookie
        const cookieToken = (0, cookie_1.getCookie)(c, opts.cookie.name);
        // If there's no token in the cookie, generate one and return an error
        if (!cookieToken) {
            const newToken = generateToken();
            (0, cookie_1.setCookie)(c, opts.cookie.name, newToken, opts.cookie);
            return c.json({ error: "CSRF token is missing" }, 403);
        }
        // Get the token from the header
        const headerToken = c.req.header(opts.tokenHeader || "X-CSRF-Token");
        // Validate the token
        if (!headerToken || headerToken !== cookieToken) {
            return c.json({ error: "Invalid CSRF token" }, 403);
        }
        // Continue with the request
        await next();
        // Refresh the token if it's about to expire
        // This is optional but recommended for enhanced security
        const newToken = generateToken();
        (0, cookie_1.setCookie)(c, opts.cookie.name, newToken, opts.cookie);
    };
};
exports.csrf = csrf;
exports.default = exports.csrf;
