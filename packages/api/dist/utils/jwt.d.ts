import { UserRole } from "../types/auth.types";
/**
 * JWT payload interface
 */
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    [key: string]: unknown;
}
/**
 * Generate a JWT token
 */
export declare function generateToken(payload: JwtPayload, expiresIn?: string): Promise<string>;
/**
 * Generate a refresh token
 */
export declare function generateRefreshToken(payload: JwtPayload, expiresIn?: string): Promise<string>;
/**
 * Verify a JWT token
 */
export declare function verifyToken(token: string): Promise<JwtPayload>;
/**
 * Verify a refresh token
 */
export declare function verifyRefreshToken(token: string): Promise<JwtPayload>;
