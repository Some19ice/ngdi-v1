"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const auth_types_1 = require("../../../types/auth.types");
const auth_utils_1 = require("../../../utils/auth.utils");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
// Mock auth utils
globals_1.jest.mock("../../../utils/auth.utils", () => ({
    verifyToken: globals_1.jest.fn(),
    extractTokenFromHeader: globals_1.jest.fn(),
}));
(0, globals_1.describe)("Auth Middleware", () => {
    (0, globals_1.describe)("authMiddleware", () => {
        let ctx;
        let next;
        let mockJson;
        let mockSet;
        let mockHeader;
        beforeEach(() => {
            mockJson = globals_1.jest.fn().mockReturnThis();
            mockSet = globals_1.jest.fn();
            mockHeader = globals_1.jest.fn();
            ctx = {
                req: {
                    header: mockHeader,
                },
                set: mockSet,
                json: mockJson,
            };
            next = globals_1.jest.fn().mockImplementation(() => Promise.resolve());
        });
        (0, globals_1.it)("should pass with valid token", async () => {
            const mockToken = "valid.token.here";
            const mockUser = { id: "1", role: auth_types_1.UserRole.USER };
            mockHeader.mockReturnValue(`Bearer ${mockToken}`);
            auth_utils_1.extractTokenFromHeader.mockReturnValue(mockToken);
            auth_utils_1.verifyToken.mockImplementation(() => Promise.resolve(mockUser));
            await (0, auth_middleware_1.authMiddleware)(ctx, next);
            (0, globals_1.expect)(mockSet).toHaveBeenCalledWith("user", mockUser);
            (0, globals_1.expect)(next).toHaveBeenCalled();
        });
        (0, globals_1.it)("should return 401 without token", async () => {
            mockHeader.mockReturnValue(undefined);
            await (0, auth_middleware_1.authMiddleware)(ctx, next);
            (0, globals_1.expect)(mockJson).toHaveBeenCalledWith({ error: "Unauthorized - No token provided" }, 401);
            (0, globals_1.expect)(next).not.toHaveBeenCalled();
        });
        (0, globals_1.it)("should return 401 with invalid token", async () => {
            mockHeader.mockReturnValue("Bearer invalid.token");
            auth_utils_1.extractTokenFromHeader.mockReturnValue("invalid.token");
            auth_utils_1.verifyToken.mockImplementation(() => Promise.reject(new Error("Invalid token")));
            await (0, auth_middleware_1.authMiddleware)(ctx, next);
            (0, globals_1.expect)(mockJson).toHaveBeenCalledWith({ error: "Unauthorized - Invalid token" }, 401);
            (0, globals_1.expect)(next).not.toHaveBeenCalled();
        });
    });
    (0, globals_1.describe)("requireRole", () => {
        let ctx;
        let next;
        let mockJson;
        let mockGet;
        beforeEach(() => {
            mockJson = globals_1.jest.fn().mockReturnThis();
            mockGet = globals_1.jest.fn();
            ctx = {
                get: mockGet,
                json: mockJson,
            };
            next = globals_1.jest.fn().mockImplementation(() => Promise.resolve());
        });
        (0, globals_1.it)("should pass with sufficient role", async () => {
            const mockUser = { id: "1", role: auth_types_1.UserRole.ADMIN };
            mockGet.mockReturnValue(mockUser);
            await (0, auth_middleware_1.requireRole)(auth_types_1.UserRole.ADMIN)(ctx, next);
            (0, globals_1.expect)(next).toHaveBeenCalled();
        });
        (0, globals_1.it)("should return 401 when user not found in context", async () => {
            mockGet.mockReturnValue(undefined);
            await (0, auth_middleware_1.requireRole)(auth_types_1.UserRole.ADMIN)(ctx, next);
            (0, globals_1.expect)(mockJson).toHaveBeenCalledWith({ error: "Unauthorized - User not found in context" }, 401);
            (0, globals_1.expect)(next).not.toHaveBeenCalled();
        });
        (0, globals_1.it)("should return 403 with insufficient role", async () => {
            const mockUser = { id: "1", role: auth_types_1.UserRole.USER };
            mockGet.mockReturnValue(mockUser);
            await (0, auth_middleware_1.requireRole)(auth_types_1.UserRole.ADMIN)(ctx, next);
            (0, globals_1.expect)(mockJson).toHaveBeenCalledWith({ error: "Forbidden - Insufficient permissions" }, 403);
            (0, globals_1.expect)(next).not.toHaveBeenCalled();
        });
    });
});
