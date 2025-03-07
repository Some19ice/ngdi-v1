import { TestRequestOptions, TestApp } from "../../types/test.types";
export declare function expectSuccessResponse(response: Response, expectedStatus?: number): Promise<void>;
export declare function expectErrorResponse(response: Response, expectedStatus: number, expectedError?: string): Promise<void>;
export declare function makeRequest(app: TestApp, options: TestRequestOptions): Promise<Response>;
export declare function createAuthHeader(token: string): {
    Authorization: string;
};
export declare function mockDate(isoDate: string): void;
export declare function restoreDate(): void;
export declare function parseResponseBody<T>(response: Response): Promise<T>;
export declare function createMockRequest(method: string, url: string, options?: {
    headers?: Record<string, string>;
    body?: unknown;
}): Request;
