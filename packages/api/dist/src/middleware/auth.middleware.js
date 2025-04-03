"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
exports.requireRole = requireRole;
const jsonwebtoken_1 = require("jsonwebtoken");
const http_exception_1 = require("hono/http-exception");
const client_1 = require("@prisma/client");
async function authMiddleware(c, next) {
    try {
        const authHeader = c.req.header("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            console.log("[API DEBUG] No Authorization header or not Bearer token");
            throw new http_exception_1.HTTPException(401, { message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        console.log("[API DEBUG] Received auth token:", token ? `${token.substring(0, 10)}...` : "none");
        console.log("[API DEBUG] Verifying token with JWT_SECRET:", process.env.JWT_SECRET ? "present" : "missing");
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            console.log("[API DEBUG] Decoded token:", {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            });
            // If the role is already in the expected format (string), convert it to UserRole enum
            let userRole;
            if (typeof decoded.role === "string") {
                // Normalize role value to handle case differences
                const normalizedRole = decoded.role.toUpperCase();
                // Convert string role to UserRole enum
                if (normalizedRole === "ADMIN") {
                    userRole = client_1.UserRole.ADMIN;
                }
                else if (normalizedRole === "NODE_OFFICER") {
                    userRole = client_1.UserRole.NODE_OFFICER;
                }
                else {
                    userRole = client_1.UserRole.USER;
                }
                console.log("[API DEBUG] Normalized role:", {
                    original: decoded.role,
                    normalized: normalizedRole,
                    final: userRole,
                });
            }
            else {
                userRole = decoded.role;
            }
            // Set user in context
            c.set("user", {
                id: decoded.userId,
                email: decoded.email,
                role: userRole,
            });
            console.log("[API DEBUG] User set in context:", {
                id: decoded.userId,
                email: decoded.email,
                role: userRole,
            });
            return await next();
        }
        catch (jwtError) {
            console.error("[API DEBUG] JWT verification error:", jwtError);
            throw new http_exception_1.HTTPException(401, { message: "Invalid token" });
        }
    }
    catch (error) {
        console.error("[API DEBUG] Auth middleware error:", error);
        throw new http_exception_1.HTTPException(401, { message: "Invalid token" });
    }
}
async function adminMiddleware(c, next) {
    const user = c.get("user");
    console.log("[API DEBUG] Admin middleware check:", {
        userRole: user.role,
        isAdmin: user.role === client_1.UserRole.ADMIN,
    });
    if (user.role !== client_1.UserRole.ADMIN) {
        throw new http_exception_1.HTTPException(403, { message: "Forbidden" });
    }
    await next();
}
function requireRole(role) {
    return async (c, next) => {
        const user = c.get("user");
        if (!user) {
            return c.json({ error: "Unauthorized - User not found in context" }, 401);
        }
        if (user.role !== role) {
            return c.json({ error: "Forbidden - Insufficient permissions" }, 403);
        }
        await next();
    };
}
