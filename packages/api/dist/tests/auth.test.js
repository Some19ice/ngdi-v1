"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const prisma_1 = require("../db/prisma");
const setup_1 = require("./setup");
const auth_types_1 = require("../types/auth.types");
const globals_1 = require("@jest/globals");
const password_1 = require("../utils/password");
(0, globals_1.describe)("Auth Routes", () => {
    (0, globals_1.beforeAll)(async () => {
        await (0, setup_1.clearDatabase)();
    }, 30000);
    (0, globals_1.afterAll)(async () => {
        await (0, setup_1.clearDatabase)();
        await prisma_1.prisma.$disconnect();
        // Close any open server connections
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 500);
        });
    }, 30000);
    (0, globals_1.describe)("POST /api/auth/register", () => {
        (0, globals_1.it)("should register a new user", async () => {
            const response = await index_1.default.request("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "newuser@example.com",
                    password: "password123",
                    name: "New User",
                }),
            });
            (0, globals_1.expect)(response.status).toBe(201);
            const data = await response.json();
            (0, globals_1.expect)(data).toHaveProperty("message", "User registered successfully");
        });
        (0, globals_1.it)("should return 400 for invalid registration data", async () => {
            const response = await index_1.default.request("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "invalid-email",
                    password: "short",
                }),
            });
            (0, globals_1.expect)(response.status).toBe(400);
            const data = await response.json();
            (0, globals_1.expect)(data).toHaveProperty("message");
        });
    });
    (0, globals_1.describe)("POST /api/auth/login", () => {
        (0, globals_1.beforeEach)(async () => {
            await (0, setup_1.clearDatabase)();
            await prisma_1.prisma.user.create({
                data: {
                    email: "test@example.com",
                    password: await (0, password_1.hashPassword)("password123"),
                    name: "Test User",
                    role: auth_types_1.UserRole.USER,
                    emailVerified: new Date(), // Set email as verified
                },
            });
        }, 30000);
        (0, globals_1.it)("should login successfully with valid credentials", async () => {
            const response = await index_1.default.request("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "test@example.com",
                    password: "password123",
                }),
            });
            (0, globals_1.expect)(response.status).toBe(200);
            const data = await response.json();
            (0, globals_1.expect)(data).toHaveProperty("token");
        });
        (0, globals_1.it)("should return 401 for invalid credentials", async () => {
            const response = await index_1.default.request("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "test@example.com",
                    password: "wrongpassword",
                }),
            });
            (0, globals_1.expect)(response.status).toBe(401);
            const data = await response.json();
            (0, globals_1.expect)(data).toHaveProperty("message", "Invalid credentials");
        });
    });
    (0, globals_1.describe)("GET /api/auth/verify-email", () => {
        let user;
        (0, globals_1.beforeEach)(async () => {
            await (0, setup_1.clearDatabase)();
            user = await (0, setup_1.createTestUser)();
            await (0, setup_1.createTestVerificationToken)(user.email);
        }, 30000);
        (0, globals_1.it)("should return 200 for valid token", async () => {
            const response = await index_1.default.request("/api/auth/verify-email?token=valid_token", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            (0, globals_1.expect)(response.status).toBe(200);
            const data = await response.json();
            (0, globals_1.expect)(data).toHaveProperty("message", "Email verified successfully");
        });
        (0, globals_1.it)("should return 400 for invalid token", async () => {
            const response = await index_1.default.request("/api/auth/verify-email?token=invalid_token", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            (0, globals_1.expect)(response.status).toBe(400);
            const data = await response.json();
            (0, globals_1.expect)(data).toHaveProperty("message", "Invalid token");
        });
    });
});
