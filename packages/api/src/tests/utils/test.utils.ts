import { Context, Env } from "hono"

// Simple mock for request
export function createMockRequest(
  url = "https://example.com",
  method = "GET",
  headers = {},
  body?: any
): any {
  return {
    url,
    method,
    headers: new Headers(headers),
    json: async () => body || {},
    text: async () => JSON.stringify(body || {}),
    valid: () => body || {},
  }
}

// Simple mock for context
export function createMockContext(req = createMockRequest()): any {
  const mockContext = {
    req,
    env: {} as Env,
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
  }
  return mockContext
}

// Mock date for testing
const originalDate = global.Date

export function mockDate(date: Date): void {
  // @ts-ignore
  global.Date = class extends originalDate {
    constructor() {
      super()
      return date
    }
  }
  global.Date.now = () => date.getTime()
}

export function restoreDate(): void {
  // @ts-ignore
  global.Date = originalDate
}
