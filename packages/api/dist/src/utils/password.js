"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateRandomPassword = generateRandomPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Hash a password
 * @param password Plain text password
 * @returns Hashed password
 */
async function hashPassword(password) {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(password, salt);
}
/**
 * Compare a password with a hash
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns Whether the password matches the hash
 */
async function comparePassword(password, hashedPassword) {
    return bcryptjs_1.default.compare(password, hashedPassword);
}
/**
 * Generate a random password
 * @param length Length of the password
 * @returns Random password
 */
function generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}
