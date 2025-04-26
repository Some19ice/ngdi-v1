/**
 * Centralized auth paths for consistent usage across the application
 */
export const AUTH_PATHS = {
  /**
   * The sign-in page path
   */
  SIGNIN: "/auth/signin",

  /**
   * The callback page path for OAuth providers
   */
  CALLBACK: "/auth/callback",

  /**
   * The reset password page path
   */
  RESET_PASSWORD: "/auth/reset-password",

  /**
   * The new user profile setup page path
   */
  NEW_USER: "/auth/new-user",

  /**
   * The unauthorized access page path
   */
  UNAUTHORIZED: "/unauthorized",
}

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  "/profile",
  "/metadata",
  "/settings",
  "/metadata/add",
]

/**
 * Debug routes that should bypass middleware protection
 */
export const DEBUG_ROUTES = [
  "/admin-debug",
  "/test-middleware",
  "/api/auth-debug",
]

/**
 * Admin-only routes
 */
export const ADMIN_ROUTES = [
  "/admin",
  "/admin/analytics",
  "/admin/users",
  "/admin/settings",
  "/admin/metadata",
  "/admin/organizations",
]

/**
 * Node officer routes
 */
export const NODE_OFFICER_ROUTES = [
  "/metadata/add",
  "/metadata/create",
  "/metadata/edit",
]
