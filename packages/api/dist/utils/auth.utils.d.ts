import { UserRole } from "../types/auth.types";
export interface TokenPayload {
    id: string;
    role: UserRole;
    [key: string]: unknown;
}
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hashedPassword: string): Promise<boolean>;
export declare function generateToken(payload: TokenPayload): Promise<string>;
export declare function verifyToken(token: string): Promise<TokenPayload>;
export declare function extractTokenFromHeader(header: string): string;
