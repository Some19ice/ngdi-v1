"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedValidation = getCachedValidation;
exports.cacheValidationResult = cacheValidationResult;
exports.quickValidateToken = quickValidateToken;
const jose = __importStar(require("jose"));
const client_1 = require("@prisma/client");
const validationCache = [];
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
/**
 * Clean expired entries from the validation cache
 */
function cleanCache() {
    const now = Date.now();
    const validEntries = validationCache.filter((entry) => now - entry.timestamp < CACHE_TTL);
    if (validEntries.length < validationCache.length) {
        validationCache.length = 0;
        validationCache.push(...validEntries);
    }
}
/**
 * Get cached validation result for a token
 */
function getCachedValidation(token) {
    cleanCache();
    const entry = validationCache.find((e) => e.token === token);
    return entry ? entry.result : null;
}
/**
 * Store validation result in cache
 */
function cacheValidationResult(token, result) {
    cleanCache();
    // Remove oldest entry if at capacity
    if (validationCache.length >= MAX_CACHE_SIZE) {
        validationCache.shift();
    }
    validationCache.push({
        token,
        result,
        timestamp: Date.now(),
    });
}
/**
 * Quick validation of JWT token (synchronous)
 * This performs basic validation without cryptographic verification
 */
function quickValidateToken(token) {
    try {
        // Check cache first
        const cachedResult = getCachedValidation(token);
        if (cachedResult) {
            return cachedResult;
        }
        // Basic validation
        if (!token || token.trim() === "") {
            const result = { isValid: false, error: "Empty token provided" };
            cacheValidationResult(token, result);
            return result;
        }
        // Check token format
        if (!token.includes(".") || token.split(".").length !== 3) {
            const result = {
                isValid: false,
                error: "Invalid token format (not a JWT)",
            };
            cacheValidationResult(token, result);
            return result;
        }
        // Decode the token without verification (fast operation)
        try {
            const decoded = jose.decodeJwt(token);
            // Check expiration
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < currentTime) {
                const result = {
                    isValid: false,
                    error: "Token expired",
                    exp: decoded.exp
                };
                cacheValidationResult(token, result);
                return result;
            }
            // Extract user information
            const userId = typeof decoded.sub === "string"
                ? decoded.sub
                : typeof decoded.userId === "string"
                    ? decoded.userId
                    : "";
            if (!userId) {
                const result = { isValid: false, error: "Missing user ID in token" };
                cacheValidationResult(token, result);
                return result;
            }
            const email = typeof decoded.email === "string" ? decoded.email : "unknown";
            // Normalize role
            let role;
            const roleValue = decoded.role;
            if (roleValue) {
                const upperRole = roleValue.toUpperCase();
                if (Object.values(client_1.UserRole).includes(upperRole)) {
                    role = upperRole;
                }
                else {
                    role = client_1.UserRole.USER;
                }
            }
            else {
                role = client_1.UserRole.USER;
            }
            const result = {
                isValid: true,
                userId,
                email,
                role,
                exp: decoded.exp,
            };
            cacheValidationResult(token, result);
            return result;
        }
        catch (error) {
            const result = {
                isValid: false,
                error: `JWT decode error: ${error instanceof Error ? error.message : String(error)}`,
            };
            cacheValidationResult(token, result);
            return result;
        }
    }
    catch (error) {
        return {
            isValid: false,
            error: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
