"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const http_exception_1 = require("hono/http-exception");
const client_1 = require("@prisma/client");
const auth_utils_1 = require("../utils/auth.utils");
const error_handler_1 = require("../middleware/error-handler");
const jwt_1 = require("../utils/jwt");
const crypto_1 = require("crypto");
const role_mapper_1 = require("../utils/role-mapper");
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
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new http_exception_1.HTTPException(401, { message: "Invalid credentials" });
        }
        const isValidPassword = await this.validatePassword(data.password, user.password);
        if (!isValidPassword) {
            throw new http_exception_1.HTTPException(401, { message: "Invalid credentials" });
        }
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
                id: jwtPayload.userId,
                role: jwtPayload.role,
            };
            const accessToken = await (0, auth_utils_1.generateToken)(tokenPayload);
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
        console.log(`Password reset token for ${email}: ${token}`);
    }
    async resetPassword(token, newPassword) {
        const verificationToken = await prisma_1.prisma.verificationToken.findUnique({
            where: { token },
        });
        if (!verificationToken) {
            throw new error_handler_1.ApiError("Invalid or expired token", 400, error_handler_1.ErrorCode.VALIDATION_ERROR);
        }
        if (verificationToken.expires < new Date()) {
            await prisma_1.prisma.verificationToken.delete({
                where: { token },
            });
            throw new error_handler_1.ApiError("Token has expired", 400, error_handler_1.ErrorCode.VALIDATION_ERROR);
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: verificationToken.identifier },
        });
        if (!user) {
            throw new error_handler_1.ApiError("User not found", 404, error_handler_1.ErrorCode.RESOURCE_NOT_FOUND);
        }
        const hashedPassword = await (0, bcryptjs_1.hash)(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
            },
        });
        await prisma_1.prisma.verificationToken.delete({
            where: { token },
        });
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
