import { PrismaClient } from "@prisma/client";
export interface AuthResult {
    success: boolean;
    token?: string;
    error?: string;
}
export interface RegistrationData {
    email: string;
    password: string;
    name: string;
}
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaClient);
    login(email: string, password: string): Promise<AuthResult>;
    register(data: RegistrationData): Promise<AuthResult>;
    verifyEmail(token: string): Promise<AuthResult>;
    refreshToken(refreshToken: string): Promise<AuthResult>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
}
export declare const authService: AuthService;
