"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = exports.AuthErrorCode = void 0;
var AuthErrorCode;
(function (AuthErrorCode) {
    AuthErrorCode["INVALID_CREDENTIALS"] = "AUTH001";
    AuthErrorCode["ACCOUNT_LOCKED"] = "AUTH002";
    AuthErrorCode["TOKEN_EXPIRED"] = "AUTH003";
    AuthErrorCode["INSUFFICIENT_PERMISSIONS"] = "AUTH004";
    AuthErrorCode["TOKEN_BLACKLISTED"] = "AUTH005";
    AuthErrorCode["RATE_LIMITED"] = "AUTH006";
    AuthErrorCode["INVALID_TOKEN"] = "AUTH007";
    AuthErrorCode["EMAIL_NOT_VERIFIED"] = "AUTH008";
    AuthErrorCode["PASSWORD_POLICY"] = "AUTH009";
    AuthErrorCode["MFA_REQUIRED"] = "AUTH010";
    AuthErrorCode["FORBIDDEN"] = "AUTH011";
    AuthErrorCode["CSRF_TOKEN_INVALID"] = "AUTH012";
})(AuthErrorCode || (exports.AuthErrorCode = AuthErrorCode = {}));
class AuthError extends Error {
    constructor(code, message, status = 401, details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
        this.name = "AuthError";
    }
}
exports.AuthError = AuthError;
