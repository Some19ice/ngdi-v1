"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.extractTokenFromHeader = extractTokenFromHeader;
const jose_1 = require("jose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const textEncoder = new TextEncoder();
const jwtSecret = textEncoder.encode(config_1.config.jwt.secret);
async function hashPassword(password) {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
}
async function comparePassword(password, hashedPassword) {
    return bcryptjs_1.default.compare(password, hashedPassword);
}
async function generateToken(payload) {
    const token = await new jose_1.SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(jwtSecret);
    return token;
}
async function verifyToken(token) {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, jwtSecret);
        return payload;
    }
    catch (error) {
        throw new Error("Invalid token");
    }
}
function extractTokenFromHeader(header) {
    const [type, token] = header.split(" ");
    if (type !== "Bearer") {
        throw new Error("Invalid token type");
    }
    return token;
}
