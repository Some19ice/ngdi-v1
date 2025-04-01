"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const http_exception_1 = require("hono/http-exception");
const client_1 = require("@prisma/client");
const error_types_1 = require("../types/error.types");
const jwt_1 = require("../utils/jwt");
const crypto_1 = require("crypto");
const role_mapper_1 = require("../utils/role-mapper");
const email_service_1 = require("../services/email.service");
const jwt_2 = require("../utils/jwt");
class AuthService {
    constructor() { }
    static generateToken(user) {
        return (0, jsonwebtoken_1.sign)({
            userId: user.id,
            email: user.email,
            role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
        }, process.env.JWT_SECRET, { expiresIn: "24h" });
    }
    static async validatePassword(password, hashedPassword) {
        return (0, bcryptjs_1.compare)(password, hashedPassword);
    }
    static async login(data) {
        console.log("AuthService.login called with email:", data.email);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        console.log("User found:", user ? "Yes" : "No");
        if (!user) {
            console.log("User not found, throwing 401");
            throw new http_exception_1.HTTPException(401, { message: "Invalid credentials" });
        }
        console.log("Validating password");
        const isValidPassword = await this.validatePassword(data.password, user.password);
        console.log("Password valid:", isValidPassword);
        if (!isValidPassword) {
            console.log("Invalid password, throwing 401");
            throw new http_exception_1.HTTPException(401, { message: "Invalid credentials" });
        }
        console.log("Generating tokens");
        const accessToken = this.generateToken(user);
        const refreshToken = await (0, jwt_1.generateRefreshToken)({
            userId: user.id,
            email: user.email,
            role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
        });
        const { password: _, ...userWithoutPassword } = user;
        console.log("Login successful, returning response");
        return {
            user: {
                id: user.id,
                name: user.name || "",
                email: user.email,
                role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
                organization: user.organization || undefined,
                department: user.department || undefined,
            },
            accessToken,
            refreshToken,
        };
    }
    static async register(data) {
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new http_exception_1.HTTPException(400, { message: "Email already registered" });
        }
        const hashedPassword = await (0, bcryptjs_1.hash)(data.password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: client_1.UserRole.USER,
                organization: data.organization,
                department: data.department,
                phone: data.phone,
            },
        });
        const accessToken = this.generateToken(user);
        const refreshToken = await (0, jwt_1.generateRefreshToken)({
            userId: user.id,
            email: user.email,
            role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
        });
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: {
                id: user.id,
                name: user.name || "",
                email: user.email,
                role: (0, role_mapper_1.mapPrismaRoleToAppRole)(user.role),
                organization: user.organization || undefined,
                department: user.department || undefined,
            },
            accessToken,
            refreshToken,
        };
    }
    static async validateToken(token) {
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.userId },
            });
            if (!user) {
                throw new http_exception_1.HTTPException(401, { message: "User not found" });
            }
            return user;
        }
        catch (error) {
            throw new http_exception_1.HTTPException(401, { message: "Invalid token" });
        }
    }
    async verifyEmail(token) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: token },
            });
            if (!user) {
                return { success: false, error: "Invalid verification token" };
            }
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() },
            });
            return { success: true };
        }
        catch (error) {
            console.error("Email verification error:", error);
            return { success: false, error: "Email verification failed" };
        }
    }
    async refreshToken(refreshToken) {
        try {
            const jwtPayload = await (0, jwt_1.verifyRefreshToken)(refreshToken);
            const tokenPayload = {
                userId: jwtPayload.userId,
                email: jwtPayload.email,
                role: jwtPayload.role,
            };
            const accessToken = await (0, jwt_2.generateToken)(tokenPayload);
            const newRefreshToken = await (0, jwt_1.generateRefreshToken)(jwtPayload);
            return { success: true, token: accessToken };
        }
        catch (error) {
            console.error("Refresh token error:", error);
            return { success: false, error: "Refresh token failed" };
        }
    }
    async forgotPassword(email) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            // Don't reveal that the user doesn't exist
            return;
        }
        const token = (0, crypto_1.randomUUID)();
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        await prisma_1.prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });
        // Send password reset email
        await email_service_1.emailService.sendPasswordResetEmail(email, token);
    }
    async resetPassword(token, newPassword) {
        const verificationToken = await prisma_1.prisma.verificationToken.findUnique({
            where: { token },
        });
        if (!verificationToken) {
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "Invalid or expired token", 400);
        }
        if (verificationToken.expires < new Date()) {
            await prisma_1.prisma.verificationToken.delete({
                where: { token },
            });
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.TOKEN_EXPIRED, "Token has expired", 400);
        }
        const hashedPassword = await (0, bcryptjs_1.hash)(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { password: hashedPassword },
        });
        await prisma_1.prisma.verificationToken.delete({
            where: { token },
        });
    }
    static async verifyEmail(token) {
        const verificationToken = await prisma_1.prisma.verificationToken.findFirst({
            where: {
                token,
                expires: {
                    gt: new Date(),
                },
            },
        });
        if (!verificationToken) {
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "Invalid or expired token", 400);
        }
        // Update user
        await prisma_1.prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
        });
        // Delete verification token
        await prisma_1.prisma.verificationToken.delete({
            where: { token },
        });
    }
    static async forgotPassword(email) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            // Don't reveal that the user doesn't exist
            return;
        }
        const token = (0, crypto_1.randomUUID)();
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        await prisma_1.prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });
        // Send password reset email
        await email_service_1.emailService.sendPasswordResetEmail(email, token);
    }
    static async resetPassword(token, newPassword) {
        const verificationToken = await prisma_1.prisma.verificationToken.findUnique({
            where: { token },
        });
        if (!verificationToken) {
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.INVALID_TOKEN, "Invalid or expired token", 400);
        }
        if (verificationToken.expires < new Date()) {
            await prisma_1.prisma.verificationToken.delete({
                where: { token },
            });
            throw new error_types_1.AuthError(error_types_1.AuthErrorCode.TOKEN_EXPIRED, "Token has expired", 400);
        }
        const hashedPassword = await (0, bcryptjs_1.hash)(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { password: hashedPassword },
        });
        await prisma_1.prisma.verificationToken.delete({
            where: { token },
        });
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
