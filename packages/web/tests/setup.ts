import "@testing-library/jest-dom"
import { vi } from "vitest"
import React from "react"

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

// Mock Next.js image component
vi.mock("next/image", () => ({
  default: vi.fn().mockImplementation((props) => {
    return { type: "img", props: { ...props } }
  }),
}))

// Mock Supabase client
vi.mock("@/lib/supabase-client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
    },
  }),
}))

// Global test setup
beforeAll(() => {
  // Setup global test environment
  console.log("Setting up test environment")
})

afterAll(() => {
  // Clean up global test environment
  console.log("Cleaning up test environment")
})
