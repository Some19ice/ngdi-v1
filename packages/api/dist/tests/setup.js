"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaClient = exports.prisma = void 0;
exports.clearDatabase = clearDatabase;
exports.createTestUser = createTestUser;
exports.createTestAdmin = createTestAdmin;
exports.generateTestToken = generateTestToken;
exports.createTestVerificationToken = createTestVerificationToken;
exports.createTestMetadata = createTestMetadata;
exports.setupTestEnvironment = setupTestEnvironment;
exports.teardownTestEnvironment = teardownTestEnvironment;
exports.createTestRequest = createTestRequest;
const client_1 = require("@prisma/client");
const config_1 = require("../config");
const jose_1 = require("jose");
const auth_types_1 = require("../types/auth.types");
const prisma_1 = require("../db/prisma");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_1.prisma; } });
const password_1 = require("../utils/password");
const test_utils_1 = require("./utils/test.utils");
require("@jest/globals");
// Create a test Prisma client
exports.prismaClient = new client_1.PrismaClient();
// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder();
const jwtSecret = textEncoder.encode(config_1.config.jwt.secret);
// Clean up database before tests
async function clearDatabase() {
    // Delete all records in reverse order of dependencies
    await prisma_1.prisma.metadata.deleteMany({});
    await prisma_1.prisma.verificationToken.deleteMany({});
    await prisma_1.prisma.user.deleteMany({});
}
// Create a test user
async function createTestUser(role = auth_types_1.UserRole.USER) {
    const user = await prisma_1.prisma.user.create({
        data: {
            email: role === auth_types_1.UserRole.ADMIN ? "admin@example.com" : "test@example.com",
            password: await (0, password_1.hashPassword)("password123"),
            name: "Test User",
            role: role,
            emailVerified: new Date(),
        },
    });
    return {
        id: user.id,
        email: user.email,
        password: user.password,
        role: role,
        name: user.name || undefined,
        emailVerified: user.emailVerified || undefined,
        image: user.image || undefined,
        organization: user.organization || undefined,
        department: user.department || undefined,
        phone: user.phone || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
// Create a test admin user
async function createTestAdmin() {
    return createTestUser(auth_types_1.UserRole.ADMIN);
}
// Generate a test JWT token
async function generateTestToken(user) {
    const token = await new jose_1.SignJWT({
        id: user.id,
        role: user.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(jwtSecret);
    return token;
}
// Create a test verification token
async function createTestVerificationToken(email, token = "valid_token") {
    await prisma_1.prisma.verificationToken.create({
        data: {
            token,
            identifier: email,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
    });
}
// Create test metadata
async function createTestMetadata(userId) {
    const metadata = await exports.prismaClient.metadata.create({
        data: {
            userId,
            title: "Test Metadata",
            author: "Test Author",
            organization: "Test Organization",
            dateFrom: "2024-01-01",
            dateTo: "2024-12-31",
            abstract: "Test abstract",
            purpose: "Test purpose",
            thumbnailUrl: "https://example.com/thumbnail.jpg",
            imageName: "thumbnail.jpg",
            frameworkType: "Test Framework",
            categories: ["Test Category"],
            coordinateSystem: "WGS84",
            projection: "UTM",
            scale: 1000,
            accuracyLevel: "High",
            email: "test@example.com",
            fileFormat: "GeoJSON",
            distributionFormat: "Digital",
            accessMethod: "Download",
            licenseType: "CC BY 4.0",
            usageTerms: "Attribution required",
            attributionRequirements: "Cite source",
            contactPerson: "Test Contact",
        },
    });
    return metadata;
}
// Global setup
async function setupTestEnvironment() {
    // Clear database
    await clearDatabase();
    // Create test users
    const user = await createTestUser();
    const admin = await createTestAdmin();
    // Create test metadata
    await createTestMetadata(user.id);
    return {
        user,
        admin,
        userToken: await generateTestToken(user),
        adminToken: await generateTestToken(admin),
    };
}
// Global teardown
async function teardownTestEnvironment() {
    await clearDatabase();
    await exports.prismaClient.$disconnect();
}
// Helper to create a test request
async function createTestRequest(options) {
    const { method, path, body, headers = {} } = options;
    const req = new Request(`http://localhost${path}`, {
        method,
        headers: new Headers(headers),
        body: body ? JSON.stringify(body) : undefined,
    });
    const ctx = (0, test_utils_1.createMockContext)(req);
    if (body) {
        ctx.req.json = () => Promise.resolve(body);
    }
    return ctx;
}
// Set environment variables for testing
if (typeof process.env.NODE_ENV !== "undefined") {
    process.env.NODE_ENV = "test";
}
process.env.JWT_SECRET = "test-jwt-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-token-secret";
// Global setup before all tests
beforeAll(async () => {
    await prisma_1.prisma.$connect();
});
// Global teardown after all tests
afterAll(async () => {
    await prisma_1.prisma.$disconnect();
}, 30000);
// Global setup before each test
beforeEach(async () => {
    await clearDatabase();
}, 30000);
// Global teardown after each test
afterEach(async () => {
    await prisma_1.prisma.$disconnect();
});
// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
console.error = (...args) => {
    // Filter out expected errors during tests
    if (typeof args[0] === "string" &&
        (args[0].includes("test error") ||
            args[0] === "Error:" ||
            args[0] === "Login error:" ||
            args[0] === "Registration error:" ||
            args[0] === "Token refresh error:" ||
            args[0] === "Password reset error:" ||
            args[0] === "Email verification error:")) {
        return;
    }
    originalConsoleError(...args);
};
