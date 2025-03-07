"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockContext = createMockContext;
function createMockContext(req) {
    const mockContext = {
        req,
        env: {},
        finalized: false,
        get: () => undefined,
        set: () => mockContext,
        header: () => mockContext,
        status: () => mockContext,
        body: () => mockContext,
        json: () => mockContext,
        text: () => mockContext,
        redirect: () => mockContext,
        notFound: () => mockContext,
        res: undefined,
        error: () => mockContext,
        event: undefined,
        executionCtx: undefined,
        var: {},
    };
    return mockContext;
}
