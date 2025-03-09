"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jose_1 = require("jose");
const config_1 = require("../config");
// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder();
const jwtSecret = textEncoder.encode(config_1.config.jwt.secret);
const refreshSecret = textEncoder.encode(config_1.config.jwt.refreshSecret); // Use the refresh secret for refresh tokens
/**
 * Generate a JWT token
 */
async function generateToken(payload, expiresIn = config_1.config.jwt.expiresIn) {
    const token = await new jose_1.SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(jwtSecret);
    return token;
}
/**
 * Generate a refresh token
 */
async function generateRefreshToken(payload, expiresIn = config_1.config.jwt.refreshExpiresIn) {
    const token = await new jose_1.SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(refreshSecret);
    return token;
}
/**
 * Verify a JWT token
 */
async function verifyToken(token) {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, jwtSecret);
        return payload;
    }
    catch (error) {
        throw new Error("Invalid token");
    }
}
/**
 * Verify a refresh token
 */
async function verifyRefreshToken(token) {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, refreshSecret);
        return payload;
    }
    catch (error) {
        throw new Error("Invalid refresh token");
    }
}
