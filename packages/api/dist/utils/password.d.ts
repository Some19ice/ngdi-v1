/**
 * Hash a password
 * @param password Plain text password
 * @returns Hashed password
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compare a password with a hash
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns Whether the password matches the hash
 */
export declare function comparePassword(password: string, hashedPassword: string): Promise<boolean>;
/**
 * Generate a random password
 * @param length Length of the password
 * @returns Random password
 */
export declare function generateRandomPassword(length?: number): string;
