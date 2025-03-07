"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const auth_service_1 = require("../../../services/auth.service");
const auth_types_1 = require("../../../types/auth.types");
const auth_utils_1 = require("../../../utils/auth.utils");
// Mock dependencies
globals_1.jest.mock("@prisma/client");
globals_1.jest.mock("../../../utils/auth.utils");
globals_1.jest.mock("../../../lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: globals_1.jest.fn(),
            create: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
        },
        verificationToken: {
            findUnique: globals_1.jest.fn(),
            create: globals_1.jest.fn(),
            delete: globals_1.jest.fn(),
        },
    },
}));
// Import the mocked prisma
const prisma_1 = require("../../../lib/prisma");
(0, globals_1.describe)("AuthService", () => {
    const mockUser = {
        id: "1",
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
        role: auth_types_1.UserRole.USER,
        emailVerified: new Date(),
        image: null,
        organization: null,
        department: null,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const registrationData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
    };
    const loginData = {
        email: "test@example.com",
        password: "password123",
    };
    beforeEach(() => {
        // Clear all mocks
        globals_1.jest
            .clearAllMocks()(
        // Mock utility functions
        auth_utils_1.hashPassword)
            .mockImplementation(() => Promise.resolve("hashedPassword"));
        auth_utils_1.comparePassword.mockImplementation(() => Promise.resolve(true));
        auth_utils_1.generateToken.mockImplementation(() => Promise.resolve("mockToken"));
    });
    (0, globals_1.describe)("login", () => {
        (0, globals_1.it)("should login successfully with valid credentials", async () => {
            ;
            prisma_1.prisma.user.findUnique.mockResolvedValueOnce(mockUser);
            const result = await auth_service_1.AuthService.login(loginData);
            (0, globals_1.expect)(result).toEqual({
                success: true,
                token: "mockToken",
            });
            (0, globals_1.expect)(prisma_1.prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: "test@example.com" },
            });
            (0, globals_1.expect)(auth_utils_1.comparePassword).toHaveBeenCalledWith("password123", "hashedPassword");
        });
        (0, globals_1.it)("should fail with invalid email", async () => {
            ;
            prisma_1.prisma.user.findUnique.mockResolvedValueOnce(null);
            const result = await auth_service_1.AuthService.login({
                email: "wrong@email.com",
                password: "password123",
            });
            (0, globals_1.expect)(result).toEqual({
                success: false,
                error: "Invalid credentials",
            });
        });
        (0, globals_1.it)("should fail with invalid password", async () => {
            ;
            prisma_1.prisma.user.findUnique.mockResolvedValueOnce(mockUser);
            auth_utils_1.comparePassword.mockImplementation(() => Promise.resolve(false));
            const result = await auth_service_1.AuthService.login({
                email: "test@example.com",
                password: "wrongpassword",
            });
            (0, globals_1.expect)(result).toEqual({
                success: false,
                error: "Invalid credentials",
            });
        });
    });
    (0, globals_1.describe)("register", () => {
        (0, globals_1.it)("should register successfully with valid data", async () => {
            ;
            prisma_1.prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma_1.prisma.user.create.mockResolvedValueOnce({
                ...registrationData,
                id: "1",
                role: "USER",
                emailVerified: null,
                image: null,
                organization: null,
                department: null,
                phone: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const result = await auth_service_1.AuthService.register(registrationData);
            (0, globals_1.expect)(result).toEqual({
                success: true,
                token: "mockToken",
            });
            (0, globals_1.expect)(prisma_1.prisma.user.create).toHaveBeenCalledWith({
                data: {
                    ...registrationData,
                    password: "hashedPassword",
                    role: "USER",
                },
            });
        });
        (0, globals_1.it)("should fail if email already exists", async () => {
            ;
            prisma_1.prisma.user.findUnique.mockResolvedValueOnce(mockUser);
            const result = await auth_service_1.AuthService.register(registrationData);
            (0, globals_1.expect)(result).toEqual({
                success: false,
                error: "Email already exists",
            });
            (0, globals_1.expect)(prisma_1.prisma.user.create).not.toHaveBeenCalled();
        });
    });
    (0, globals_1.describe)("verifyEmail", () => {
        let authService;
        beforeEach(() => {
            authService = new auth_service_1.AuthService();
        });
        (0, globals_1.it)("should verify email successfully", async () => {
            const mockUser = {
                id: "1",
                email: registrationData.email,
                emailVerified: null,
                name: null,
                image: null,
                password: "hashedPassword",
                role: auth_types_1.UserRole.USER,
                organization: null,
                department: null,
                phone: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }(prisma_1.prisma.user.findUnique).mockResolvedValueOnce(mockUser);
            prisma_1.prisma.user.update.mockResolvedValueOnce({
                ...mockUser,
                emailVerified: new Date(),
            });
            const result = await authService.verifyEmail("valid-token");
            (0, globals_1.expect)(result).toEqual({
                success: true,
            });
            (0, globals_1.expect)(prisma_1.prisma.user.update).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                data: { emailVerified: globals_1.expect.any(Date) },
            });
        });
        (0, globals_1.it)("should fail with invalid token", async () => {
            ;
            prisma_1.prisma.user.findUnique.mockResolvedValueOnce(null);
            const result = await authService.verifyEmail("invalid-token");
            (0, globals_1.expect)(result).toEqual({
                success: false,
                error: "Invalid verification token",
            });
            (0, globals_1.expect)(prisma_1.prisma.user.update).not.toHaveBeenCalled();
        });
    });
});
