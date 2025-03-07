"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables from .env file
dotenv_1.default.config();
// Define schema for environment variables
const envSchema = zod_1.z.object({
    // Server
    PORT: zod_1.z.string().optional().default("3001"),
    HOST: zod_1.z.string().optional().default("localhost"),
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .optional()
        .default("development"),
    // Database
    DATABASE_URL: zod_1.z.string(),
    DIRECT_URL: zod_1.z.string(),
    // JWT
    JWT_SECRET: zod_1.z.string(),
    JWT_EXPIRES_IN: zod_1.z.string().optional().default("1d"),
    REFRESH_TOKEN_SECRET: zod_1.z.string(),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.z.string().optional().default("7d"),
    // CORS
    ALLOWED_ORIGINS: zod_1.z.string(),
    // Rate Limiting
    RATE_LIMIT_WINDOW: zod_1.z.string().optional().default("60000"),
    RATE_LIMIT_MAX: zod_1.z.string().optional().default("100"),
    AUTH_RATE_LIMIT_WINDOW: zod_1.z.string().optional().default("60000"),
    AUTH_RATE_LIMIT_MAX: zod_1.z.string().optional().default("10"),
    // Email
    SMTP_HOST: zod_1.z.string(),
    SMTP_PORT: zod_1.z.string(),
    SMTP_USER: zod_1.z.string(),
    SMTP_PASSWORD: zod_1.z.string(),
    EMAIL_FROM: zod_1.z.string(),
});
// Parse environment variables
exports.config = envSchema.parse(process.env);
