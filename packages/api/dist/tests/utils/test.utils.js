"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockRequest = createMockRequest;
exports.createMockContext = createMockContext;
exports.mockDate = mockDate;
exports.restoreDate = restoreDate;
// Simple mock for request
function createMockRequest(url = "https://example.com", method = "GET", headers = {}, body) {
    return {
        url,
        method,
        headers: new Headers(headers),
        json: async () => body || {},
        text: async () => JSON.stringify(body || {}),
        valid: () => body || {},
    };
}
// Simple mock for context
function createMockContext(req = createMockRequest()) {
    const mockContext = {
        req,
        env: {},
        finalized: false,
        get: () => undefined,
        set: () => mockContext,
        header: () => mockContext,
        status: () => mockContext,
        body: () => new Response(),
        json: () => new Response(),
        text: () => new Response(),
        redirect: () => new Response(),
        notFound: () => new Response(),
        res: undefined,
        error: new Error(),
        event: undefined,
        executionCtx: undefined,
        var: {},
    };
    return mockContext;
}
// Mock date for testing
const originalDate = global.Date;
function mockDate(date) {
    // @ts-ignore
    global.Date = class extends originalDate {
        constructor() {
            super();
            return date;
        }
    };
    global.Date.now = () => date.getTime();
}
function restoreDate() {
    // @ts-ignore
    global.Date = originalDate;
}
